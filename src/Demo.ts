var fallbackMachine: Core.IMachineData = {"n":"Missing Machine","a":"Tiaratum Games","v":3,"d":"01i57hz4i1o0706hwi1hz203111000hyi1hz403121000hyi0hz211111006i0hzhz314121006hxhzhz304111000i0hzhz20110100bi2hyhz2311010"};

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
        { name: "gravitywell", i: 0, j: -1, k: 0, mirrorZ: false, color: 0 },
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

var reworkingGoldenLoops = {
    n: "Golden Loops",
    a: "Sven Frankson",
    v: 4,
    d: "06hk9huzi0004hk9hx5i0006hk9hzci0003hk9i1ji0008hk9i3qi0005hk9i5xi00040q04hui5i011111301100hvi5i0911111000i4i4i0211111006i6i4i0202101006i0i3hz415121006hxi3i0304111009hvi1i024220110hi4i1i0233101007hyi1hz234111000i0i1i0221111000i2i1i0201101000hxi1i1741111100i2i0hz211101100i0hzi2451111007i4hyhz23310110ai0hxhz23330110ai4hxi2223211006i6hxi0203101000i4hxi0201101000i1hxi0341111000huhti1441101109hyhthz243121106hshti0202111100hvhti0681101005huhsi01111060010100bhshri02f11110",
};

var reworkingLargeTornado = {
    n: "Large Tornado",
    a: "Tiaratum Games",
    v: 3,
    d: "06i5ci0si50i5ci2zi50i5ci56i50i5ci7di50i5ci9ki50i5cibri500i06hsi1hx405131000hwhzhx421111000i0hzhx201101000hyhxi2441111009hwhxi1242101006i2hwhy415101006hzhvhy314131006i2huhy314101006hyhthy415131006i2hshy415101006hyhrhy416131006i2hqhy416101006hxhphy517131006i2hohy517101006hwhnhy618131006i2hmi1415101006hyhlhx41511100bi2hkhx2f11010",
};

var reworkingSkyScrew = {
    n: "Sky Screw",
    a: "Sven",
    v: 3,
    d: "05i3vi7jhyci3ti2jhyci6oi52hv0i6ni00hv0i71ia9hyc0i06i4i0i0304101000i0hzi0411101006hyhzi0202111001i0hyi181111100di2hxi32311151000006i0hxi1203111107i8hvi1233101000i1hvi4531101009i6hui324212100di2hui12311051000006i4hui1203101107hzhsi223311100di2hri32311151000006i0hri1203111106i6hqi1202101000i1hqi255111100di2hoi1231105100000ai4hoi12232010",
};

var reworkingJumping = {
    n: "Jumping",
    a: "Sven",
    v: 3,
    d: "07hk9huzi00hk9hx4i00hk9hzai00hk9i1fi00hk9i3li00hk9i5qi00hk9i7wi000m00hwi5i0612131004hui5i021111301106i5i3hz20310100ai2i3i1323311000i0i3hz501101009hwi1i024220110gi0i1i2221501007hyi0hz234111000i3hzhz201101100hyhzi176111110gi4hzi222141100gi4hzi0221711006i5hzhz203101107i6hyi023310100gi1hyi022170100ai0hxhz323201109hyhthz243121100huhti1441101106hshti0202111100hwhti0571101005huhri02211060010100bhshqi02g11110",
};

var testSnake = {
    n: "Two in One",
    a: "Tiaratum Games",
    v: 3,
    d: "06i5chz4i1oi5ci1ai1oi5ci3gi1ohtci0ri50hyai37i50i22i54i500q00hzi1hz301101000hxi0hz211101006hvi0hz202111006i4i0i0202101000hxi0i0101101002hyi0hz403101000i2i0i0201101000hwhzi1231111000i1hzi1311101002hyhzi0303101006hvhzhx202111100huhyi1241101000hxhyhy211111100huhyi2511111106hshyhz203111000huhyhz101101006hzhyhy405101107hshwi023311110ahvhwhz223211002hxhwhy30310100ai0hvhz21311100bi2huhz27110100dhxhuhx5511051000000huhui0551111106i2huhx304101100hzhui03011011",
};
