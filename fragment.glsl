precision mediump float;

#define M_PI 3.1415926535897932384626433832795

uniform vec4 uBasic;
uniform bool uIsBasic;

uniform vec4 uGlobalAmbient;
uniform vec4 uAmbient[2], uDiffuse[2], uSpecular[2];
uniform bool uLightOn[2];
uniform float uShine;
uniform sampler2D uTextureId, uCloudsId;
uniform float uCloudsOffset;
uniform bool uCloudsEnabled;

varying vec3 L[2], N, E;
varying float dist[2];
varying vec2 texCoords;

void main() {
    if (uIsBasic) {
        gl_FragColor = uBasic;
    } else {
        vec4 color = uGlobalAmbient;
        vec2 texCoord = vec2( atan(N.z, N.x) / (2. * M_PI), acos(N.y) / M_PI);
        vec4 tex   = texture2D(uTextureId, texCoord);

        vec3 NM = N;

        for (int i = 0; i < 2; i++) {
            if (uLightOn[i]) {
                vec3 H = normalize(L[i] - E);

                color += uAmbient[i] / dist[i];

                float Kd = max(dot(L[i], NM), 0.0);
                color += Kd * (tex + uDiffuse[i]) / dist[i];

                float shine = uShine;
                if (dot(L[i], NM) > 0.0) {
                    float Ks = pow(max(dot(NM, H), 0.0), shine);
                    color += Ks * uSpecular[i] / dist[i];
                }
            }
        }

        gl_FragColor = color;
    }
}
