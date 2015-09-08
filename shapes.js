var Shape = function () {
    this.sections  = [];
    this.settings  = { x: 0, y: 0, z: -2, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 };
    this.transform = translate(0, 0, -2);
    this.ambient   = vec4(0.3, 0.3, 0.3, 1.0);
    this.diffuse   = vec4(0.3, 0.3, 0.3, 1.0);
    this.specular  = vec4(0.7, 0.7, 0.7, 1.0);
    this.shine     = 50.0;
    this.texture   = 1;
    this.normalMap = 2;
};

Shape.accuracy       = Math.PI / 180,  // resolution of shapes

Shape.TRIANGLES      = 4;
Shape.TRIANGLE_STRIP = 5;
Shape.TRIANGLE_FAN   = 6;

Shape.prototype.getParameters = function() {
    return this.settings;
};

Shape.prototype.position = function(x, y, z) {
    this.setParameters(x, y, z,
                       this.settings.rx,
                       this.settings.ry,
                       this.settings.rz,
                       this.settings.sx,
                       this.settings.sy,
                       this.settings.sz);
};

Shape.prototype.orientation = function(rx, ry, rz) {
    this.setParameters(this.settings.x,
                       this.settings.y,
                       this.settings.z,
                       rx, ry, rz,
                       this.settings.sx,
                       this.settings.sy,
                       this.settings.sz);
};

Shape.prototype.setParameters = function(x, y, z, rx, ry, rz, sx, sy, sz) {
    this.settings = { x: x, y: y, z: z, rx: rx, ry: ry, rz: rz, sx: sx, sy: sy, sz: sz };

    var  m = mult(translate(x, y, z), rotate(rx, 1, 0, 0));
    m = mult(m, rotate(ry, 0, 1, 0));
    m = mult(m, rotate(rz, 0, 0, 1));
    m = mult(m, mscale(sx, sy, sz));

    this.transform = m;
};

Shape.prototype.getColors = function() {
    return {
        ambient: {
            r: this.ambient[0],
            g: this.ambient[1],
            b: this.ambient[2]
        },
        diffuse: {
            r: this.diffuse[0],
            g: this.diffuse[1],
            b: this.diffuse[2]
        },
        specular: {
            r: this.specular[0],
            g: this.specular[1],
            b: this.specular[2]
        },
        shine: this.shine
    };
};

Shape.prototype.setColors = function(a, d, s, z) {
    this.ambient = vec4(a[0], a[1], a[2], 1.0);
    this.diffuse = vec4(d[0], d[1], d[2], 1.0);
    this.specular = vec4(s[0], s[1], s[2], 1.0);
    this.shine = z;
};

Shape.prototype.addSection = function(method, vertices, normals, texcoords) {
    this.sections.push( {
        method: method,
        vertices: vertices,
        normals: normals,
        texcoords: texcoords
    } );
};

var makeSphere = function(r) {
    var sphere = genSphere(r);
    var shape = new Shape();
    shape.addSection(Shape.TRIANGLES, sphere.vertices, sphere.normals, sphere.texcoords);
    return shape;
};
