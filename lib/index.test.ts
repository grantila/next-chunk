import nextChunk, { nextChunk as nextChunkExported } from '../index.js'

import { Readable } from 'stream'
import through2 from 'through2'
import { buffer as getStreamAsBuffer } from 'get-stream'


describe( 'default', ( ) =>
{
	it( 'should export default and named', ( ) =>
	{
		expect( nextChunk ).toBe( nextChunkExported );
	} );

	it( 'should get null on already ended stream', async ( ) =>
	{
		const stream = through2( );

		stream.end( );

		const data = await nextChunk( stream );

		expect( data ).toBeNull( );
	} );

	it( 'should get only chunk on stream ended with data', async ( ) =>
	{
		const stream = through2( );

		stream.end( 'data' );

		const data1 = await nextChunk( stream );
		const data2 = await nextChunk( stream );

		expect( data1.toString( ) ).toBe( 'data' );
		expect( data2 ).toBeNull( );
	} );

	it( 'should get two chunks', async ( ) =>
	{
		const stream = through2( );

		stream.write( 'foo' );
		const data1 = await nextChunk( stream );

		stream.write( 'bar' );
		const data2 = await nextChunk( stream );

		stream.end( );
		const data3 = await nextChunk( stream );

		expect( data1.toString( ) ).toBe( 'foo' );
		expect( data2.toString( ) ).toBe( 'bar' );
		expect( data3 ).toBeNull( );
	} );

	it( 'should get two async chunks', async ( ) =>
	{
		const stream = through2( );

		setTimeout( ( ) => stream.write( 'foo' ), 5 );
		const data1 = await nextChunk( stream );

		setTimeout( ( ) => stream.write( 'bar' ), 5 );
		const data2 = await nextChunk( stream );

		setTimeout( ( ) => stream.end( ), 50 );
		const data3 = await nextChunk( stream );

		expect( data1.toString( ) ).toBe( 'foo' );
		expect( data2.toString( ) ).toBe( 'bar' );
		expect( data3 ).toBeNull( );
	} );

	it( 'should handle destroyed stream', async ( ) =>
	{
		const stream = through2( );

		stream.write( 'foo' );
		const data1 = await nextChunk( stream );

		stream.destroy( );
		const data2 = await nextChunk( stream );

		expect( data1.toString( ) ).toBe( 'foo' );
		expect( data2 ).toBeNull( );
	} );

	it( 'should handle error in reading', async ( ) =>
	{
		const stream = new Readable( );
		const testError = new Error( "Test error" );

		const datas = [ 'foo' ];

		stream._read = function( )
		{
			if ( datas.length === 0 )
			{
				setImmediate( ( ) => this.emit( 'error', testError ) );
				return;
			}

			this.push( datas.shift( ) );
		};

		const data1 = await nextChunk( stream );

		try
		{
			await nextChunk( stream );

			expect( false ).toBe( true );
		}
		catch ( err )
		{
			expect( data1.toString( ) ).toBe( 'foo' );
			expect( err ).toBe( testError );
		}
	} );

	it( 'should handle error event', async ( ) =>
	{
		const stream = through2( );

		stream.write( 'foo' );
		const data1 = await nextChunk( stream );

		const asyncData2 = nextChunk( stream );
		stream.emit( 'error', new Error( "bar" ) );
		try
		{
			await asyncData2;

			expect( false ).toBe( true );
		}
		catch ( err )
		{
			expect( data1.toString( ) ).toBe( 'foo' );
			expect( err.message ).toBe( 'bar' );
		}
	} );

	it( 'should reject falsy stream', async ( ) =>
	{
		try
		{
			await nextChunk( null );

			expect( false ).toBe( true );
		}
		catch ( err )
		{
			expect( err.message ).toContain( 'Not a' );
		}
	} );

	it( 'should be possible to pipe stream after a chunk', async ( ) =>
	{
		const stream = through2( );

		setTimeout( ( ) => stream.write( 'foo' ), 5 );
		const data1 = await nextChunk( stream );

		setTimeout( ( ) => stream.end( 'bar' ), 5 );
		const stream2 = through2( );

		stream.pipe( stream2 );

		const data2 = await getStreamAsBuffer( stream2 );

		expect( data1.toString( ) ).toBe( 'foo' );
		expect( data2.toString( ) ).toBe( 'bar' );
	} );
} );
