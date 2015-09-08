function UI(shapes, lights) {

    var setup = function(ids, shape, values) {
        var p = document.getElementById(ids[0]),
            r = document.getElementById(ids[1]),
            t = document.getElementById(ids[2]);
        if (values !== undefined) {
            p.value = values[0];
            r.value = values[1];
            t.value = values[2];
        }
        [p, r, t].forEach(function(c) {
            c.oninput = function() {
                var pv = p.value,
                    rv = r.value,
                    tv = t.value;
                shape.orientation(pv, rv, tv);
            };
            c.oninput();
        });
    };

    var normcheck = function(id, shape) {
        var chk = document.getElementById(id);
        chk.onchange = function() {
            shape.normalMap = chk.checked ? shape.texture + 1 : -1;
        };
    };

    var randoms = function() {
        return [
            Math.floor(Math.random() * 360 - 180),
            Math.floor(Math.random() * 360 - 180),
            Math.floor(Math.random() * 360 - 180)
        ];
    };

    setup(['phi', 'rho', 'thet'], shapes[1], [-52, 175, 29]);
    setup(['phi_', 'rho_', 'the_'], shapes[0], randoms());
    setup(['phi0', 'rho0', 'the0'], shapes[2], randoms());

    //normcheck('spec', shapes[1]);
    //normcheck('spec0', shapes[2]);
}
