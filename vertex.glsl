attribute vec3 aPosition, aNormal;
attribute vec2 aTexture;
uniform mat4 uPerspective, uTransform;
uniform vec4 uLight[2];

varying vec3 L[2], N, E, T;
varying float dist[2];
varying vec2 texCoords;

void main() {
    texCoords = aTexture;

    vec4 pos = uTransform * vec4(aPosition, 1.0);
    gl_Position = uPerspective * pos;

    N = normalize((uTransform * vec4(aNormal, 0.0)).xyz);
    E = normalize(pos.xyz);
    T = normalize((vec4(aNormal, 1.0)).xyz);

    for (int i = 0; i < 2; i++) {
        L[i] = normalize(uLight[i].xyz - pos.xyz);
        dist[i] = length(uLight[i].xyz - pos.xyz);
        /*
            H[i] = normalize(L[i] - E);

            vColor += uAmbient[i] / dist;

            float Kd = max(dot(L[i], N), 0.0);
            vColor += Kd * uDiffuse[i] / dist;

            float Ks = pow(max(dot(N, H[i]), 0.0), uShine);
            if (dot(L[i], N) > 0.0) {
                vColor += Ks * uSpecular[i] / dist;
            }
        }
        */
    }
}