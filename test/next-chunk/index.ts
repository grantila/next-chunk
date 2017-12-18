'use strict'

import 'mocha'
import { expect } from 'chai'

import nextChunk from '../../'

import { Readable } from 'stream'
import * as through2 from 'through2'
import { buffer as getStreamAsBuffer } from 'get-stream'


describe( 'default', ( ) =>
{
	it( 'should get null on already ended stream', async ( ) =>
	{
		const stream = through2( );

		stream.end( );

		const data = await nextChunk( stream );

		expect( data ).to.be.null;
	} );

	it( 'should get only chunk on stream ended with data', async ( ) =>
	{
		const stream = through2( );

		stream.end( 'data' );

		const data1 = await nextChunk( stream );
		const data2 = await nextChunk( stream );

		expect( data1.toString( ) ).to.equal( 'data' );
		expect( data2 ).to.be.null;
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

		expect( data1.toString( ) ).to.equal( 'foo' );
		expect( data2.toString( ) ).to.equal( 'bar' );
		expect( data3 ).to.be.null;
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

		expect( data1.toString( ) ).to.equal( 'foo' );
		expect( data2.toString( ) ).to.equal( 'bar' );
		expect( data3 ).to.be.null;
	} );

	it( 'should handle destroyed stream', async ( ) =>
	{
		const stream = through2( );

		stream.write( 'foo' );
		const data1 = await nextChunk( stream );

		stream.destroy( );
		const data2 = await nextChunk( stream );

		expect( data1.toString( ) ).to.equal( 'foo' );
		expect( data2 ).to.be.null;
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

			expect( false ).to.be.true;
		}
		catch ( err )
		{
			expect( data1.toString( ) ).to.equal( 'foo' );
			expect( err ).to.equal( testError );
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

			expect( false ).to.be.true;
		}
		catch ( err )
		{
			expect( data1.toString( ) ).to.equal( 'foo' );
			expect( err.message ).to.equal( 'bar' );
		}
	} );

	it( 'should reject falsy stream', async ( ) =>
	{
		try
		{
			await nextChunk( null );

			expect( false ).to.be.true;
		}
		catch ( err )
		{
			expect( err.message ).to.contain( 'Not a' );
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

		expect( data1.toString( ) ).to.equal( 'foo' );
		expect( data2.toString( ) ).to.equal( 'bar' );
	} );
} );
