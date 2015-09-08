var textures = {};

(function() {
    var texSize = 128,
        checkers = 8,
        checkpixels = texSize / checkers;

    var board = new Uint8Array(4*texSize*texSize);
    for (var i = 0; i < texSize; i++) {
        for (var j = 0; j < texSize; j++) {
            var px = Math.floor(i / checkpixels),
                py = Math.floor(j / checkpixels),
                c  = ((px%2) ^ (py%2)) ? 255 : 0,
                d  = (((i & 0x08) == 0) ^ ((j & 0x08) == 0)) ? 255 : 0;
            board[4 * i * texSize + 4 * j + 0] = d;
            board[4 * i * texSize + 4 * j + 1] = d;
            board[4 * i * texSize + 4 * j + 2] = d;
            board[4 * i * texSize + 4 * j + 3] = 255;
        }
    }

    textures.checkers = function(gl, i) {
        var tex = gl.createTexture();
        gl.activeTexture(i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, board);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return tex;
    };

    var textureLoaded = function(gl, image, texture, i) {
        return function() {
            gl.activeTexture(i);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        };
    };

    var image = function(src) {
        return function(gl, i) {
            var texture = gl.createTexture(),
                image   = new Image();
            image.onload = textureLoaded(gl, image, texture, i);
            image.src = src;
            return texture;
        };
    };

    textures.deathstar = image('deathstar.jpg');
    textures.phobos    = image('phobos.gif');
    textures.mars      = image('mars_1k_color.jpg');
    textures.marsBumps = image('mars_1k_normal.jpg');
}());
