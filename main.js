window.onload = function() {

	// Keyboard event to switch between shaders.
	var bRenderOriginal = true;
	document.addEventListener('keydown', function(event) {
		if(event.keyCode == 37) {
			bRenderOriginal = !bRenderOriginal;
		}
		else if(event.keyCode == 39) {
			bRenderOriginal = !bRenderOriginal;
		}
	});


	var container = document.getElementById( 'container' ),
		containerWidth, containerHeight,
		renderer,
		scene,
		camera,
		cubes,
		range = 50,
		mouseVector,
		axes;

	containerWidth = container.clientWidth;
	containerHeight = container.clientHeight;

	// Set up renderer, scene and camera
	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor( 0x000000 );
	renderer.setSize( containerWidth, containerHeight );

	container.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	var scene2 = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, containerWidth / containerHeight, 1, 10000 );
	camera.position.set( 0, 0, range * 2 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	// Add some cubes to the scene
	var nObjects = 100;

	var geometryArr = InitGeometry(nObjects, range);
	var geom = geometryArr[0];
	var geom2 = geometryArr[1];

	var uniforms = {
		nObjects:     { type: 'f', value: nObjects }
	};

	var attributes = {
		objID:        { type: 'f', value: null }
	};

	var objIDMat = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById( 'objIDShaderVert' ).textContent,
		fragmentShader: document.getElementById( 'objIDShaderFrag' ).textContent
	});

	var shadingMat = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById( 'renderpickingVert' ).textContent,
		fragmentShader: document.getElementById( 'renderpickingFrag' ).textContent
	});

	var mesh = new THREE.Mesh( geom, objIDMat );
	var mesh2 = new THREE.Mesh( geom2, shadingMat );

	scene.add( mesh );
	scene2.add( mesh2 );

	// Axes
	var axes = buildAxes();
	scene2.add( axes );

	// Picking stuff

	projector = new THREE.Projector();
	mouseVector = new THREE.Vector3();

	// User interaction
	window.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

	var controls = new THREE.TrackballControls( camera );
	controls.zoomSpeed = 0.01;

	var renderTargetParams = {
		minFilter:THREE.LinearFilter,
		stencilBuffer:false,
		depthBuffer:true
	};
	var renderTargetTex = new THREE.WebGLRenderTarget( containerWidth, containerHeight, renderTargetParams );
	var pixels = new Uint8Array( 4 * containerWidth * containerHeight );

	// And go!
	animate();
	var time = 0;

	function renderWithPick() {

		if( bRenderOriginal ) {
			var n1 = new Date().getTime();
			renderer.render( scene, camera, renderTargetTex, true );
			var n2 = new Date().getTime();
			time = n2 - n1;

			// Read from tex.
			var gl = renderer.getContext();
			gl.readPixels( 0, 0, containerWidth, containerHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

			renderer.render( scene2, camera );
		}
		else
			renderer.render( scene, camera );

	}

	function onMouseMove( e ) {
		var index = Math.floor( (containerWidth * (containerHeight - e.clientY - 1) + e.clientX) * 4 );

		document.getElementById("headline").innerHTML = pixels[ index ] + pixels[ index + 1 ] * 255;
		document.getElementById("elapsedTime").innerHTML = time.toString();
	}

	function onWindowResize( e ) {
		containerWidth = container.clientWidth;
		containerHeight = container.clientHeight;
		renderer.setSize( containerWidth, containerHeight );
		camera.aspect = containerWidth / containerHeight;
		camera.updateProjectionMatrix();
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		renderWithPick();
	}


	// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
	function buildAxes() {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z

		return axes;

	}

	function buildAxis( src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );

		var axis = new THREE.Line( geom, mat );

		return axis;

	}

}




function InitGeometry(nObj, range) {

	var cubePoints = [
					-2.5,-2.5,-2.5,
					-2.5,-2.5, 2.5,
					-2.5, 2.5, 2.5,
					2.5, 2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5,-2.5,
					2.5,-2.5, 2.5,
					-2.5,-2.5,-2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5,-2.5,
					2.5,-2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5, 2.5,
					-2.5, 2.5,-2.5,
					2.5,-2.5, 2.5,
					-2.5,-2.5, 2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5, 2.5,
					-2.5,-2.5, 2.5,
					2.5,-2.5, 2.5,
					2.5, 2.5, 2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5,-2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5, 2.5,
					2.5,-2.5, 2.5,
					2.5, 2.5, 2.5,
					2.5, 2.5,-2.5,
					-2.5, 2.5,-2.5,
					2.5, 2.5, 2.5,
					-2.5, 2.5,-2.5,
					-2.5, 2.5, 2.5,
					2.5, 2.5, 2.5,
					-2.5, 2.5, 2.5,
					2.5,-2.5, 2.5
					];

	var nVertices = cubePoints.length / 3; // Should be 36. ( 6 sides * 2 triangles * 3 vertices )

	var vertices = new Float32Array( nObj * nVertices * 3 ); // three components per vertex
	var objIDArr = new Float32Array( nObj * nVertices );

	var vertices2 = new Float32Array( nObj * nVertices * 3 ); // three components per vertex
	var objIDArr2 = new Float32Array( nObj * nVertices * 3 );

	for( var k = 0 ; k < nObj ; k++ ) { // k == obj ID.
		
		var trans = [ range * ( 0.5 - Math.random()), range * ( 0.5 - Math.random()), range * ( 0.5 - Math.random()) ];

		for( var j = 0 ; j < nVertices ; j++) {

			// set model space transition.
			for ( var i = 0; i < 3 ; i++ ) { // one vertex is 3 components.

				vertices[ k * nVertices * 3 + j * 3 + i ] = cubePoints[j * 3 + i] + trans[i];

				vertices2[ k * nVertices * 3 + j * 3 + i ] = cubePoints[j * 3 + i] + trans[i];
				objIDArr2[ k * nVertices * 3 + j * 3 + i ] = k;
			}

			objIDArr[k * nVertices + j] = k;
		}
	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'objID', new THREE.BufferAttribute( objIDArr, 1 ) );

	var geometry2 = new THREE.BufferGeometry();
	geometry2.addAttribute( 'position', new THREE.BufferAttribute( vertices2, 3 ) );
	geometry2.addAttribute( 'objID', new THREE.BufferAttribute( objIDArr2, 3 ) );

	//geometry.computeBoundingSphere();

	return [geometry, geometry2];
}



function InitGeometry2(nObj, range) {

	var cubePoints = [
					-2.5,-2.5,-2.5,
					-2.5,-2.5, 2.5,
					-2.5, 2.5, 2.5,
					2.5, 2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5,-2.5,
					2.5,-2.5, 2.5,
					-2.5,-2.5,-2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5,-2.5,
					2.5,-2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5, 2.5,
					-2.5, 2.5,-2.5,
					2.5,-2.5, 2.5,
					-2.5,-2.5, 2.5,
					-2.5,-2.5,-2.5,
					-2.5, 2.5, 2.5,
					-2.5,-2.5, 2.5,
					2.5,-2.5, 2.5,
					2.5, 2.5, 2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5,-2.5,
					2.5,-2.5,-2.5,
					2.5, 2.5, 2.5,
					2.5,-2.5, 2.5,
					2.5, 2.5, 2.5,
					2.5, 2.5,-2.5,
					-2.5, 2.5,-2.5,
					2.5, 2.5, 2.5,
					-2.5, 2.5,-2.5,
					-2.5, 2.5, 2.5,
					2.5, 2.5, 2.5,
					-2.5, 2.5, 2.5,
					2.5,-2.5, 2.5
					];

	var nVertices = cubePoints.length / 3; // Should be 36. ( 6 sides * 2 triangles * 3 vertices )

	var vertices = new Float32Array( nObj * nVertices * 3 ); // three components per vertex
	var objIDArr = new Float32Array( nObj * nVertices * 3 );

	for( var k = 0 ; k < nObj ; k++ ) { // k == obj ID.
		
		var trans = [ range * ( 0.5 - Math.random()), range * ( 0.5 - Math.random()), range * ( 0.5 - Math.random()) ];

		for( var j = 0 ; j < nVertices ; j++) {

			// set model space transition.
			for ( var i = 0; i < 3 ; i++ ) { // one vertex is 3 components.

				vertices[ k * nVertices * 3 + j * 3 + i ] = cubePoints[j * 3 + i] + trans[i];
				objIDArr[ k * nVertices * 3 + j * 3 + i ] = k;
			}
		}
	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'objID', new THREE.BufferAttribute( objIDArr, 3 ) );

	//geometry.computeBoundingSphere();

	return geometry;
}

















