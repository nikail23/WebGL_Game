#version 300 es
precision mediump float;

uniform vec2 sun_position;
uniform vec3 tint;
uniform sampler2D noise_texture;
uniform vec2 uResolution;
uniform sampler2D uScreenTexture;

out vec4 fragColor;

float noise_float(float t, vec2 texResolution) {
    return texture(noise_texture, vec2(t, 0.0f) / texResolution).x;
}
float noise_vec2(vec2 t, vec2 texResolution) {
    return texture(noise_texture, t / texResolution).x;
}

float flareSpot(vec2 uvCoord, vec2 position, float offset, float power, float intensity) {
    return max(0.01f - pow(length(uvCoord + offset * position), power), 0.0f) * intensity;
}

float flareHalo(vec2 uvCoord, vec2 position, float offset, float intensity) {
    float lenSqr = length(uvCoord + offset * position);
    lenSqr *= lenSqr;
    return max(1.0f / (1.0f + 32.0f * lenSqr), 0.0f) * intensity;
}

vec3 lensflare(vec2 uv, vec2 pos, vec2 texResolution) {
    vec2 main = uv - pos;
    vec2 uvd = uv * length(uv);

    float ang = atan(main.x, main.y);
    float dist = length(main);
    dist = pow(dist, 0.1f);

    float mainLength = length(uv - pos);
    float f0 = 1.0f / (mainLength * 16.0f + 1.0f);

    float noiseVal = noise_float(sin(ang * 2.0f + pos.x) * 4.0f - cos(ang * 3.0f + pos.y), texResolution);
    f0 = f0 + f0 * (sin(noiseVal * 16.0f) * 0.1f + dist * 0.1f + 0.8f);

    float f2 = flareHalo(uvd, pos, 0.8f, 0.25f);
    float f22 = flareHalo(uvd, pos, 0.85f, 0.23f);
    float f23 = flareHalo(uvd, pos, 0.9f, 0.21f);

    vec2 uvx1 = mix(uv, uvd, -0.5f);

    float f4 = flareSpot(uvx1, pos, 0.4f, 2.4f, 6.0f);
    float f42 = flareSpot(uvx1, pos, 0.45f, 2.4f, 5.0f);
    float f43 = flareSpot(uvx1, pos, 0.5f, 2.4f, 3.0f);

    vec2 uvx2 = mix(uv, uvd, -0.4f);

    float f5 = flareSpot(uvx2, pos, 0.2f, 5.5f, 2.0f);
    float f52 = flareSpot(uvx2, pos, 0.4f, 5.5f, 2.0f);
    float f53 = flareSpot(uvx2, pos, 0.6f, 5.5f, 2.0f);

    float f6 = flareSpot(uvx1, -pos, 0.3f, 1.6f, 6.0f);
    float f62 = flareSpot(uvx1, -pos, 0.325f, 1.6f, 3.0f);
    float f63 = flareSpot(uvx1, -pos, 0.35f, 1.6f, 5.0f);

    vec3 c = vec3(0.0f);

    c.r += f2 + f4 + f5 + f6;
    c.g += f22 + f42 + f52 + f62;
    c.b += f23 + f43 + f53 + f63;

    float uvdLength = length(uvd);
    c = c * 1.3f - vec3(uvdLength * 0.05f);
    c += vec3(f0);

    return c;
}

vec3 cc(vec3 color, float factor, float factor2) {
    float w = color.r + color.g + color.b;
    return mix(color, vec3(w) * factor, w * factor2);
}

void main() {
    vec2 resolution = uResolution;
    vec2 screenUV = gl_FragCoord.xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
    vec2 texResolution = vec2(textureSize(noise_texture, 0));
    vec2 uv = screenUV - vec2(0.5f);
    uv.x *= aspect;
    vec2 mouse = sun_position;
    mouse.x *= aspect;
    vec4 previousColor = texture(uScreenTexture, screenUV);

    vec3 color = previousColor.rgb;
    color += tint * lensflare(uv, mouse, texResolution);
    color -= noise_vec2(gl_FragCoord.xy, texResolution) * 0.015f;
    color = cc(color, 0.5f, 0.1f);
    fragColor = vec4(color, 1.0f);
}