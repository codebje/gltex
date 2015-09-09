#define M_PI 3.1415926535897932384626433832795

attribute vec3 aPosition, aNormal;
attribute vec2 aTexture;
uniform mat4 uPerspective, uTransform;
uniform vec4 uLight[2];
uniform sampler2D uDisplacementMap;
uniform bool uUseDisplacement;

varying vec3 L[2], N, E, T;
varying float dist[2];

void main() {
    vec4 pos = uTransform * vec4(aPosition, 1.0);

    N = normalize((uTransform * vec4(aNormal, 0.0)).xyz);
    E = normalize(pos.xyz);
    T = normalize((vec4(aNormal, 1.0)).xyz);

    for (int i = 0; i < 2; i++) {
        L[i] = normalize(uLight[i].xyz - pos.xyz);
        dist[i] = length(uLight[i].xyz - pos.xyz);
    }

    if (uUseDisplacement) {
        vec2 texCoord = vec2( (M_PI + atan(T.z, T.x)) / (2. * M_PI), acos(T.y) / M_PI);
        vec4 displacement = texture2D(uDisplacementMap, texCoord);
        pos += vec4(displacement.g / 32. * N, 1.0);
    }

    gl_Position = uPerspective * pos;
}
