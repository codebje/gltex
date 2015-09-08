var genSphere = function(r) {
    var phi = (1 + Math.sqrt(5)) / 2;

    var normalise = function(v) {
        var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);// / r;
        return [ v[0] / l, v[1] / l, v[2] / l ];
    };

    var isoverts = [        // 12 vertices of an icosahedron
        [  -1,  phi,    0],
        [   1,  phi,    0],
        [  -1, -phi,    0],
        [   1, -phi,    0],
        [   0,   -1,  phi],
        [   0,    1,  phi],
        [   0,   -1, -phi],
        [   0,    1, -phi],
        [ phi,    0,   -1],
        [ phi,    0,    1],
        [-phi,    0,   -1],
        [-phi,    0,    1]
    ].map(normalise);

    var midpoint = function(v1, v2) {
        return normalise([
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ]);
    };

    var tessellate = function(faces, count) {
        if (count <= 0) { return faces; }

        var _faces = [];
        faces.forEach(function(f) {
            var a = midpoint(f[0], f[1]),
                b = midpoint(f[1], f[2]),
                c = midpoint(f[2], f[0]);

            _faces.push([f[0], a, c]);
            _faces.push([f[1], b, a]);
            _faces.push([f[2], c, b]);
            _faces.push([a, b, c]);
        });

        return tessellate(_faces, count - 1);
    };

    var faces = tessellate([
        [0, 11, 5],  [0, 5, 1],   [0, 1, 7],    [0, 7, 10],  [0, 10, 11],
        [1, 5, 9],   [5, 11, 4],  [11, 10, 2],  [10, 7, 6],  [7, 1, 8],
        [3, 9, 4],   [3, 4, 2],   [3, 2, 6],    [3, 6, 8],   [3, 8, 9],
        [4, 9, 5],   [2, 4, 11],  [6, 2, 10],   [8, 6, 7],   [9, 8, 1]
    ].map(function(f) {
        return f.map(function(e) { return isoverts[e]; });
    }), 4);

    var totex = function(face) {
        var θ = Math.acos(face[1]),
            φ = Math.atan(face[2]/ face[0]);
            π = Math.PI,
            t = [0.5 + θ / (2*π), 0.5 + φ / (2*π)];

        return t;
    };

    var vertices = [], normals = [], texcoords = [];
    faces.forEach(function(face) {
        normals.push(face[0]);
        normals.push(face[1]);
        normals.push(face[2]);
        vertices.push(face[0].map(function(v) { return v * r; }));
        vertices.push(face[1].map(function(v) { return v * r; }));
        vertices.push(face[2].map(function(v) { return v * r; }));
        texcoords.push(totex(face[0]));
        texcoords.push(totex(face[1]));
        texcoords.push(totex(face[2]));
    });

    return { vertices: vertices, normals: normals, texcoords: texcoords };
};
