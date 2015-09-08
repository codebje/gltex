function UI(shapes, lights) {
    var phi  = document.getElementById('phi'),
        rho  = document.getElementById('rho'),
        thet = document.getElementById('thet');

    phi.value = -52;
    rho.value = 175;
    thet.value = 29;
    [phi, rho, thet].forEach(function(c) {
        //c.value = Math.floor(Math.random() * 360 - 180);
        c.oninput = function() {
            var p = phi.value,
                r = rho.value,
                t = thet.value;
            shapes[1].orientation(p, r, t);
        };
        c.oninput();
    });
    var phi_ = document.getElementById('phi_'),
        rho_ = document.getElementById('rho_'),
        the_ = document.getElementById('the_');

    [phi_, rho_, the_].forEach(function(c) {
        c.value = Math.floor(Math.random() * 360 - 180);
        c.oninput = function() {
            var p = phi_.value,
                r = rho_.value,
                t = the_.value;
            shapes[0].orientation(p, r, t);
        };
        c.oninput();
    });
}
