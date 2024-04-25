var testChallenge = {
    balls: [{ x: -0.253072613110704, y: 0.04504040380131484, z: 5.551115123125783e-17 }],
    parts: [
        { name: "end", i: 0, j: 0, k: 0, mirrorZ: false, color: 0 },
        { name: "start", i: -2, j: -1, k: 0, mirrorZ: false, color: 0 },
    ],
};

var currentTest = {
    balls: [
        { x: -0.0421983410139945, y: 0.04355721865963, z: 1.1102230246251565e-16 },
        { x: -0.16477541216952107, y: 0.03441816972081398, z: -0.18000000000000022 },
        { x: -0.12211384583885848, y: 0.02594399399776657, z: -0.17999999999999994 },
        { x: -0.08103597508125635, y: 0.013511197286796714, z: -0.18000000000000005 },
        { x: -0.04157082726142615, y: 0.002664879873240697, z: -0.1800000000000001 },
        { x: -0.001549444922861784, y: -0.007272509636327362, z: -0.17999999999999988 },
    ],
    parts: [
        { name: "uturn-0.3", i: 2, j: 3, k: 1, color: 0 },
        { name: "ramp-1.1.1", i: 1, j: 2, k: 1, color: 0 },
        { name: "gravity-well", i: 0, j: -1, k: 0, mirrorZ: false, color: 0 },
        { name: "uturn-0.4", i: -3, j: -1, k: 0, mirrorX: true, color: 0 },
        { name: "ramp-1.0.1", i: -1, j: -1, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "stairway-3.6", i: -1, j: -1, k: 3, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};

var jumperTest = {
    balls: [
        { x: -0.4539999737739563, y: -0.03150000011920929, z: 0 },
        { x: -0.4539999737739563, y: 0.051655959725379945, z: 0 },
        { x: -0.4539999737739563, y: 0.13481193447113038, z: 0 },
        { x: -0.4539999737739563, y: 0.2179679092168808, z: 0 },
    ],
    parts: [
        { name: "ramp-4.2.2", i: -2, j: -1, k: -1, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 0, j: -2, k: 0, mirrorZ: false, color: 0 },
        { name: "uturn-0.2", i: 5, j: -3, k: -1, color: 0 },
        { name: "spiral-1.2.2", i: 2, j: -3, k: -1, mirrorX: true, color: 0 },
        { name: "ramp-2.0.1", i: 3, j: -3, k: -1, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "ramp-2.3.1", i: 3, j: -3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "ramp-2.6.1", i: -2, j: -7, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "elevator-9", i: -3, j: -8, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};

var leaps = {
    balls: [
        { x: -0.4539999737739563, y: -0.09150000250339509, z: 0 },
        { x: -0.4539999737739563, y: -0.012975234150886536, z: 0 },
        { x: -0.4539999737739563, y: 0.0655495491027832, z: 0 },
        { x: -0.4539999737739563, y: 0.14407431745529176, z: 0 },
        { x: -0.4539999737739563, y: 0.2225991007089615, z: 0 },
    ],
    parts: [
        { name: "uturn-0.3", i: -2, j: 4, k: 0, mirrorX: true, mirrorZ: true, color: 0 },
        { name: "uturn-0.3", i: 3, j: 4, k: 0, color: 0 },
        { name: "ramp-2.0.1", i: 1, j: 4, k: 2, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "ramp-2.1.1", i: -1, j: 3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: 3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "ramp-3.1.3", i: -2, j: 3, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 1, j: 2, k: 0, mirrorZ: false, color: 0 },
        { name: "ramp-2.4.1", i: -1, j: 0, k: 2, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 2, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 1, j: -1, k: 2, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 0, j: -2, k: 0, mirrorZ: false, color: 0 },
        { name: "wall-3.3", i: 3, j: -3, k: 0, mirrorZ: false, color: 0 },
        { name: "ramp-2.6.1", i: -2, j: -7, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "elevator-11", i: -3, j: -8, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};

var screw = {
    balls: [{ x: -0.07531240703587543, y: -0.02232514866787129, z: -0.05999999865889566 }],
    parts: [
        { name: "uturn-1.3", i: -1, j: 0, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.1.1", i: 0, j: -1, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "screw-1.3", i: 0, j: -2, k: 1, mirrorZ: false, c: 0 },
        { name: "uturn-1.3", i: 1, j: -2, k: -1, mirrorZ: true, c: 0 },
    ],
};

var longScrew = {
    balls: [{ x: -0.17944236995914156, y: -0.05884189935798628, z: -0.059999998658895576 }],
    parts: [
        { name: "ramp-1.1.1", i: -1, j: 2, k: 1, c: 0 },
        { name: "uturn-0.2", i: -2, j: 2, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: -1, j: 2, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "join", i: 0, j: 1, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "uturn-0.3", i: 1, j: -1, k: -1, mirrorZ: true, c: 0 },
        { name: "jumper-8", i: 1, j: -1, k: 0, mirrorZ: false, c: 0 },
        { name: "screw-1.4", i: 0, j: -1, k: 1, mirrorZ: false, c: 0 },
        { name: "ramp-2.2.1", i: -2, j: -1, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: -3, j: -1, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "stairway-1.4", i: 0, j: -3, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-2.2.1", i: -2, j: -3, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
    ],
};

var relax = {
    balls: [
        { x: -0.030297282196921807, y: 0.06289056178229195, z: -0.06 },
        { x: 0.17969462776441614, y: 0.005141302622776172, z: -0.06 },
        { x: 0.14770485667050623, y: 0.005141302622776172, z: -0.06 },
        { x: 0.16373458031581783, y: 0.005141302622776172, z: -0.06 },
    ],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "jumper-6", i: 2, j: -2, k: 1, mirrorZ: false, c: 0 },
        { name: "jumper-6", i: 0, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: 0 },
    ],
};

var infinityMachine = {
    balls: [
        { x: -0.06379543506766659, y: 0.09792443939048934, z: -0.06 },
        { x: 0.17969462776441614, y: 0.005141302622776172, z: -0.06 },
        { x: 0.14770485667050623, y: 0.005141302622776172, z: -0.06 },
        { x: 0.16373458031581783, y: 0.005141302622776172, z: -0.06 },
    ],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: 3, j: -2, k: 0, c: 0 },
        { name: "ramp-1.2.1", i: 2, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: 2, j: -2, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "ramp-1.3.1", i: 0, j: -3, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: -1, j: -3, k: 0, mirrorX: true, c: 0 },
        { name: "stairway-1.3", i: 1, j: -3, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: 0, j: -3, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
    ],
};

var myTest = {
    balls: [{ x: -0.030297282196921807, y: 0.06289056178229195, z: -0.06 }],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: [0] },
        { name: "jumper-6", i: 0, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: [0] },
        { name: "screw-1.2", i: 2, j: -2, k: 1, mirrorZ: false, c: [0, 1, 1, 0, 0] },
    ],
};
