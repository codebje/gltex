attribute vec3 aPosition, aNormal;
attribute vec2 aTexture;
uniform mat4 uPerspective, uTransform;
uniform vec4 uLight[2];

varying vec3 L[2], N, E, T;
varying float dist[2];

void main() {
    vec4 pos = uTransform * vec4(aPosition, 1.0);
    gl_Position = uPerspective * pos;

    N = normalize((uTransform * vec4(aNormal, 0.0)).xyz);
    E = normalize(pos.xyz);
    T = normalize((vec4(aNormal, 1.0)).xyz);

    for (int i = 0; i < 2; i++) {
        L[i] = normalize(uLight[i].xyz - pos.xyz);
        dist[i] = length(uLight[i].xyz - pos.xyz);
    }
}
