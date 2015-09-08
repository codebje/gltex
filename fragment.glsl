precision mediump float;

#define M_PI 3.1415926535897932384626433832795

uniform vec4 uBasic;
uniform bool uIsBasic;

uniform vec4 uGlobalAmbient;
uniform vec4 uAmbient[2], uDiffuse[2], uSpecular[2];
uniform bool uLightOn[2];
uniform float uShine;
uniform sampler2D uTextureId, uNormalId;
uniform bool uIsNormalMapped;

varying vec3 L[2], N, E, T;
varying float dist[2];
varying vec2 texCoords;

void main() {

    if (uIsBasic) {
        gl_FragColor = uBasic;
    } else {
        vec4 color = uGlobalAmbient;
        vec2 texCoord = vec2( atan(T.y, T.x) / (2. * M_PI), acos(T.z) / M_PI);
        vec4 tex   = texture2D(uTextureId, texCoord);

        vec3 NM = N;
        if (uIsNormalMapped) {
            vec3 TN = normalize(texture2D(uNormalId, texCoord).rgb * 2.0 - 1.0);
            NM = normalize(N + TN);
        }

        for (int i = 0; i < 2; i++) {
            if (uLightOn[i]) {
                vec3 H = normalize(L[i] - E);

                color += uAmbient[i] / dist[i];

                float Kd = max(dot(L[i], NM), 0.0);
                color += Kd * uDiffuse[i] / dist[i];

                if (dot(L[i], NM) > 0.0) {
                    float Ks = pow(max(dot(NM, H), 0.0), uShine);
                    color += Ks * uSpecular[i] / dist[i];
                }
            }
        }

        gl_FragColor = mix(color, tex * color, 0.5);
    }
}
