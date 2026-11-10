// ───────── 06 ui：景观/构件/材质数据、交互、漫步、初始化 ─────────
const VIEWS = [
  { id: 'all', n: '湖畔全景', tag: '总览', p: [30, 27, 38], l: [-14, 2, -4], txt: '一湾湖岸、一座曲桥、一座水上方亭：以集贤亭与小瀛洲九曲桥为蓝本的写意场景，远处是苏堤、雷峰塔与层叠的湖山。' },
  { id: 'lake', n: '湖光潋滟', tag: '湖面', p: [-46, 2.4, 10], l: [-70, .2, 45], txt: '西湖平均水深不过两米多，风一过便满湖碎金。远近水纹有疏有密：平处如镜，映山映塔；皱处粼粼，接住日光。' },
  { id: 'qiao', n: '九曲桥', tag: '曲桥', p: [-4, 17, 23], l: [-13, 1, -3], txt: '石板平桥贴水而行，折线把五十米的路拉长，每一折都换一个朝向看湖，古人称之为“步移景异”。' },
  { id: 'ting', n: '集贤亭', tag: '亭', p: [-19.5, 7.2, 8], l: [-36, 3.7, -6], txt: '重檐四角攒尖的水上方亭。十二根檐柱、四根金柱撑起两层屋檐，四角高高翘起，是江南“嫩戗发戗”的做法。' },
  { id: 'tingnei', n: '亭中望湖', tag: '亭', p: [-33.3, 2.45, -6.9], l: [-36.7, 2.3, -5.6], txt: '坐在美人靠上，挂落与檐柱自然成了画框：框里是湖，是三潭石塔，是南山上的雷峰塔。' },
  { id: 'lang', n: '临水曲廊', tag: '廊', p: [21, 7.5, -10], l: [4, 2.2, -20], txt: '廊随岸转，一面粉墙开漏窗，一面坐凳栏杆临水。雨天不湿鞋，晴天不晒人，是江南园林里最体贴的建筑。' },
  { id: 'xie', n: '水榭', tag: '榭', p: [-17, 6, -47], l: [.4, 2.7, -38.9], txt: '榭半在岸上、半架水面，三面设美人靠。屋顶四坡舒展，正脊两端微微起翘。' },
  { id: 'path', n: '林荫步道', tag: '步道', p: [9.9, 2.3, -50], l: [9.6, 1.9, -70], txt: '临湖一侧“一株杨柳一株桃”，内侧是香樟、悬铃木、银杏与鸡爪槭。长椅面湖而设，园灯隔十余步一盏。' },
  { id: 'arch', n: '石拱桥', tag: '拱桥', p: [-12, 3.2, 51], l: [13, 1.6, 44], txt: '单孔石拱跨过小水湾，拱券与倒影合成一轮圆月。西湖的断桥、苏堤六桥都是这样的单孔石拱桥。' },
  { id: 'gate', n: '月洞门', tag: '框景', p: [29.6, 2.15, 0], l: [20, 2.05, 0], txt: '粉墙上开一轮圆洞，正对曲桥与方亭。门是取景框，人未入园，景已入眼。' },
  { id: 'pier', n: '埠头小船', tag: '码头', p: [-9, 4.6, 31], l: [2, .8, 21], txt: '石阶入水，系着蓝布篷的摇橹船。这种手划船至今仍是游西湖最慢、也最好的方式。' },
  { id: 'lotus', n: '曲桥风荷', tag: '夏', p: [-7.5, 1.7, 10], l: [-12, .3, 5.5], m: { s: 1, t: 0 }, txt: '六月荷叶田田，高的擎出水面，低的贴水而浮。秋来只剩残荷，冬日唯余枯梗，四时各有看头。' },
  { id: 'spring', n: '桃红柳绿', tag: '春', p: [-9, 4.2, 66], l: [6, 3, 86], m: { s: 0, t: 0 }, txt: '白堤、苏堤的老规矩：一株杨柳一株桃。三月桃花开时，柳条正抽新芽，一红一绿间错到天边。' },
  { id: 'autumn', n: '秋色满堤', tag: '秋', p: [-30, 13, -44], l: [12, 5, -86], m: { s: 2, t: 0 }, txt: '银杏转金、槭叶转红、悬铃木转褐，香樟依旧浓绿。北山街与杨公堤的秋色，大抵如此。' },
  { id: 'snow', n: '亭桥残雪', tag: '冬', p: [-3, 7.5, 21], l: [-21, 2, -4], m: { s: 3, t: 0, r: 0 }, txt: '雪霁天晴，瓦垄、栏板与石板上都压着雪，向阳处先化，远望桥面似断非断，正是“断桥残雪”的意思。' },
  { id: 'leifeng', n: '雷峰夕照', tag: '黄昏', p: [-46, 6, 30], l: [-120, 20, 170], m: { t: .5 }, txt: '雷峰塔立在南岸夕照山上，吴越国时始建，1924 年倒塌，2002 年重建，八面五层。日落时塔影与晚霞同框。' },
  { id: 'santan', n: '三潭印月', tag: '月夜', p: [-186, 2.4, 174], l: [-222, 4.5, 127], m: { s: 2, t: 1 }, txt: '湖中三座石塔，高约两米，球形塔身中空、环开五个圆孔。中秋夜塔内点烛，孔中透出的光映在水里，与月影难分。' },
  { id: 'baochu', n: '保俶塔影', tag: '远山', p: [-22, 8, -4], l: [-56, 34, -300], txt: '北岸宝石山上的保俶塔，六面七层实心砖塔，瘦削挺拔。老话说“雷峰如老衲，保俶如美人”。' },
  { id: 'sudi', n: '苏堤春晓', tag: '春', p: [-470, 16, -80], l: [-570, 4, -30], m: { s: 0, t: 0 }, txt: '苏轼疏浚西湖时用淤泥筑成的长堤，近三公里，自北而南六座石拱桥：跨虹、东浦、压堤、望山、锁澜、映波。堤上一株杨柳一株桃。' },
  { id: 'duanqiao', n: '断桥残雪', tag: '冬', p: [-78, 15, -578], l: [5, 5, -638], m: { s: 3, t: 0, r: 0 }, txt: '白堤东头的单孔石拱桥。雪后桥的阳面先化，远望桥身似断非断；《白蛇传》里许仙与白娘子也在这里相遇。' },
  { id: 'pinghu', n: '平湖秋月', tag: '秋夜', p: [-128, 5, -514], l: [-178, 5, -550], m: { s: 2, t: 1 }, txt: '孤山东南角伸进湖里的一方平台，三面临水。秋夜月出，湖平如镜，是看月亮最开阔的地方。' },
  { id: 'gushan', n: '孤山', tag: '岛', p: [-300, 46, -430], l: [-335, 8, -562], txt: '西湖里最大的岛，山高不过三十多米。东接白堤、西连西泠桥，山后放鹤亭一带以梅花闻名。' },
  { id: 'xiaoying', n: '小瀛洲', tag: '岛', p: [-128, 46, 128], l: [-215, 2, 44], txt: '用浚湖的淤泥堆成的环形岛，“湖中有岛，岛中有湖”。九曲桥贯穿内湖，岛南水面立着三座石塔。' },
  { id: 'huxin', n: '湖心亭', tag: '岛', p: [-246, 20, -168], l: [-300, 5, -231], txt: '湖心的小岛与重檐楼阁，西湖三岛里建得最早。张岱《湖心亭看雪》写的就是这里。' },
  { id: 'nanping', n: '南屏晚钟', tag: '黄昏', p: [-52, 22, 462], l: [-128, 7, 560], m: { t: .5 }, txt: '南屏山下的净慈寺，黄墙殿宇。傍晚寺钟一响，山谷回应，声传湖上。点“听南屏晚钟”可以敲一下。' },
];
const LABELS = [['qiao', -13, 2.4, -3], ['ting', -36, 10.8, -6], ['lang', 5.5, 5.4, -14], ['xie', .4, 6.6, -38.9], ['arch', 13, 4.8, 44], ['gate', 24, 4.4, 0], ['pier', 1.4, 2, 21], ['santan', -215, 5, 128], ['leifeng', -330, 132, 560], ['sudi', -560, 22, -120],
  ['duanqiao', 5, 13, -638], ['pinghu', -176, 11, -548], ['gushan', -345, 40, -566], ['xiaoying', -215, 13, 42], ['huxin', -300, 15, -231], ['nanping', -128, 20, 560]];
const PGROUPS = [
  ['亭', [
    ['pv-finial', '宝顶', [-29, 10.6, -.5], [-36, 9.3, -6], '攒尖顶各条脊在顶端汇合，用宝顶压住收束，既是造型的句号，也防雨水从顶心渗入。'],
    ['pv-roof', '重檐瓦面', [-25.5, 11, 4.5], [-36, 6.3, -6], '小青瓦一仰一覆：仰瓦成沟排水，覆瓦成垄挡缝。屋面并非直坡，而是越往下越缓的凹曲线，雨水因此被抛得更远。'],
    ['pv-ridge', '戗脊翼角', [-27.6, 6.4, 3.4], [-31, 5.3, -1], '四条戗脊沿屋角而下，至檐口陡然上翘。江南“嫩戗发戗”在老戗上斜立一根嫩戗，翼角才翘得这样轻灵。'],
    ['pv-upper', '上檐花窗与匾', [-28.6, 7.3, -6], [-34, 5.95, -6], '两层屋檐之间一圈花窗，白天透气采光，入夜灯从窗格里透出，整座亭像一盏灯笼。'],
    ['pv-beam', '梁枋', [-33.2, 2.6, -8.8], [-37.4, 4.4, -4.4], '檐柱顶端以枋相连成圈，四根金柱再向上托起上檐。构件之间全靠榫卯咬合。'],
    ['pv-lattice', '挂落', [-28.4, 3.4, -4], [-32.4, 3.6, -4.8], '悬在枋下的木格花饰，用细木条以榫卯攒接成纹样。它不承重，只为给框景加一道花边。'],
    ['pv-col', '立柱与柱础', [-30, 1.9, -.9], [-32.4, 1.3, -2.4], '木柱不直接落地，而是立在石鼓磴上，把潮气隔在柱脚之外。临水建筑尤其离不开它。'],
    ['pv-seat', '美人靠', [-36.5, 2.5, -6.6], [-36, 1.5, -2.4], '又叫吴王靠、鹅颈椅：坐面之外，靠背向水面弯出，人可侧身倚栏看湖。'],
    ['pv-base', '台基', [-27, 2.6, 3], [-32, .3, -2], '条石垒砌的台基自湖底升起，面上墁方砖，四周压一圈阶条石收边。'],
    ['pv-lamp', '宫灯', [-34, 2.7, -8.2], [-36, 3.7, -6], '亭心悬六角宫灯，檐下挂红纱灯。入夜自动点亮，暖光落在石桌上，也落进水里。'],
    ['pv-table', '石桌石凳', [-33.5, 2.5, -4], [-36, 1.3, -6], '一桌四凳，凳作鼓形。亭中有此，才算真的可以坐下来。'],
  ]],
  ['曲桥', [
    ['br-deck', '桥面石板', [-1.5, 3.4, 3.6], [-8, .7, -2], '梁式石板桥：每跨三列条石并铺，转折处另置方石。桥面离水不过两三尺。'],
    ['br-rail', '栏板望柱', [-2.2, 1.9, 2], [-5, 1.2, -.6], '望柱之间嵌栏板，上有扶手、下有地栿。柱头雕作莲苞，是石栏最常见的收头。'],
    ['br-pier', '桥墩石梁', [-9, .9, 4.4], [-13, .1, -2], '成对的石柱立在湖底，柱顶架盖梁，梁上再搁桥板。隐去湖水，可以看清它们一直伸到湖床。'],
  ]],
  ['廊与榭', [
    ['co-roof', '廊顶', [15, 8, -11], [5, 4.4, -17], '双坡瓦顶，正脊压顶，两端起翘。廊子转折处屋面相交。'],
    ['co-frame', '廊柱与挂落', [5.5, 2.3, -8.6], [5.5, 2.6, -20], '柱间上悬挂落、下设坐凳栏杆，一步一框，走着就是在翻一本册页。'],
    ['co-seat', '坐凳栏杆', [9, 2.2, -27], [2.2, 1.1, -28], '矮栏上覆木板，既是栏杆也是坐凳。'],
    ['co-wall', '廊墙漏窗', [11.4, 2.5, -12.6], [6.7, 2.3, -14.6], '廊的一侧筑粉墙，墙上开漏窗。窗芯以瓦片搭成花格，透风透景而不透尽。'],
    ['co-base', '廊基', [10, 2, -5], [5.5, .7, -10], '廊下台基高出岸面一步，条石包边，方砖墁地。'],
    ['co-lamp', '廊灯', [5.5, 2.2, -10.6], [5.5, 2.9, -14.5], '廊下每隔几步悬一盏红纱灯。'],
    ['ha-roof', '水榭屋面', [-14, 8, -32], [.4, 4.8, -38.9], '四坡屋面，正脊居中，四角起翘稍缓于亭。'],
    ['ha-frame', '水榭木构', [-9, 2.4, -34], [.4, 2.6, -38.9], '十柱落地，临水三面设美人靠，面岸一侧敞开接廊。'],
    ['ha-base', '水榭台基', [-9, 1.6, -45], [-1, .3, -40], '一半落在岸上，一半探出水面。'],
    ['ha-lamp', '水榭灯', [-6, 2.6, -36], [.4, 2.9, -38.9], '榭中宫灯与四角纱灯。'],
  ]],
  ['岸线', [
    ['arch', '石拱桥', [3, 2.8, 37], [13, 1.8, 44], '拱券由一块块楔形券石砌成，受压而成拱；桥面随拱起伏，两侧石栏随坡而上。'],
    ['bank', '驳岸', [-6, 1.8, -58], [.6, .2, -50], '块石垒砌的挡墙，顶上压一道条石。西湖岸线大多是这样的石驳岸。'],
    ['path', '步道', [14, 4.5, -64], [9.5, .6, -76], '青石板错缝铺砌，两侧立道牙石。'],
    ['lawn', '草地', [20, 12, 70], [10, .6, 84], '春嫩、夏浓、秋黄，冬天盖一层薄雪。'],
    ['wall', '粉墙月洞门', [17.6, 3.2, -6.4], [24, 2.2, -.4], '纸筋灰抹面的白墙，小青瓦压顶；隔一段开一方漏窗，正中开月洞门。'],
    ['pier', '埠头', [-6, 3, 27], [3, .4, 20], '几级石阶探入水中，两旁立系船石。'],
    ['rockery', '湖石', [4.6, 2.3, 3.2], [8.6, 1.6, 6.6], '太湖石讲究“瘦、皱、漏、透”，立在桥头作对景。'],
  ]],
  ['设施', [
    ['bench', '长椅', [6.4, 1.8, 14.6], [9.6, 1, 17], '木条坐面与靠背，铸铁支架，面湖而设。'],
    ['lamp', '园灯', [1.4, 2.4, 6], [4.1, 3.2, 3], '石座、细杆、方形灯罩加四坡小顶。入夜自动点亮，灯下一圈暖光。'],
    ['boat', '摇橹船', [-5, 2.3, 26], [1.2, .9, 21], '西湖手划船：木壳、蓝白条布篷，船尾一支长橹。'],
    ['lanterns', '荷灯', [-20, 3, 12], [-28, 0, 4], '入夜后点湖面放出的荷花灯，随水缓缓漂远。'],
    ['glow', '灯火光晕', [-19.5, 7.2, 8], [-36, 3.7, -6], '夜间各处灯火的光晕与灯下光斑。'],
  ]],
  ['水与花木', [
    ['water', '湖水', [-46, 2.4, 10], [-70, .2, 45], '隐去湖水，可以看到平均两米多深的湖床，以及桥墩、台基的水下部分。'],
    ['bed', '湖床', [-20, 6, 16], [-24, -2, 0], '淤泥质的湖底。'],
    ['lotus', '荷花', [-7.5, 1.7, 10], [-12, .3, 5.5], '春生小叶、夏开花、秋成残荷、冬余枯梗。'],
    ['koi', '锦鲤', [-9, 3.6, 5.4], [-9.5, 0, 1], '桥边一群红白锦鲤。点一下水面，它们会循着涟漪游来。'],
    ['willow', '垂柳', [-8, 3.6, -57], [3.4, 4, -62], '枝条垂到水面，随风摆动。春为鹅黄，夏为浓绿，冬日只剩枯黄的细条。'],
    ['peach', '碧桃', [-2, 2.6, 60], [6.6, 2.6, 56.8], '与垂柳相间而植，三月开花。'],
    ['trees', '乔木', [0, 6, -86], [14, 6, -92], '香樟四季常青；悬铃木、银杏、鸡爪槭秋天各自变色，冬天落尽。'],
    ['plum', '梅', [10, 2.6, 8], [16.5, 2.4, 13], '冬末在枯枝上先开花，孤山、灵峰都以探梅闻名。'],
    ['shrubs', '灌木', [5, 2.4, -72], [9, .9, -76], '路边的杜鹃春天开花，墙下是修剪成团的桂花。'],
    ['bamboo', '竹', [22, 3.4, 4], [28.5, 4, 7], '月洞门后两丛竹，为白墙添一笔绿影。'],
  ]],
  ['环湖', [
    ['bai', '白堤与断桥', [-60, 26, -545], [-40, 3, -618], '白堤横在外湖与北里湖之间，中有锦带桥，东头是断桥。堤上桃柳相间。'],
    ['gushan', '孤山', [-300, 46, -430], [-335, 8, -562], '岛上有山、有楼阁、有梅林，东南角是平湖秋月的临水平台，西端经西泠桥连到苏堤。'],
    ['xiaoying', '小瀛洲', [-128, 46, 128], [-215, 2, 44], '环形的岛，中间留出内湖，十字堤与曲桥相连。'],
    ['huxin', '湖心亭与阮公墩', [-246, 20, -168], [-300, 5, -231], '湖心亭是重檐楼阁的小岛；西面更小的阮公墩是清代疏浚西湖时堆成的。'],
    ['temple', '净慈寺', [-52, 22, 462], [-128, 7, 560], '黄墙围起的三进殿宇，左右钟鼓二楼。'],
    ['north', '北山街', [-150, 46, -610], [-140, 8, -780], '北岸山脚下的一排老房子。'],
    ['city', '城东天际线', [-90, 70, 0], [700, 40, 0], '湖东是城区，近湖低、远处高，入夜亮起万家灯火。'],
  ]],
  ['远景', [
    ['santan', '三潭石塔', [-186, 2.4, 174], [-222, 4.5, 127], '湖中三座石塔，球形塔身环开五孔。'],
    ['far-leifeng', '雷峰塔', [-46, 6, 30], [-120, 20, 170], '夕照山上的雷峰塔，入夜通体金黄。'],
    ['far-baochu', '保俶塔', [-22, 8, -4], [-56, 34, -300], '宝石山上的保俶塔。'],
    ['far-su', '苏堤', [-470, 16, -80], [-570, 4, -30], '长堤卧波，桃柳成行，石拱桥隔出里外湖。'],
    ['far-hill', '群山', [10, 30, 30], [-200, 30, 40], '三面云山一面城：近山青，远山淡，层层退入雾中。'],
  ]],
];
const CRAFTS = [
  { id: 'c-stone', n: '石作', tag: '花岗岩 · 青石', mats: ['stone', 'slab', 'paving'], p: [-3, 9, 16], l: [-16, .5, -3], txt: '台基、桥板、栏杆、驳岸都是石作。条石錾凿平整后干摆或灌浆垒砌，每块石料色泽略有深浅，拼在一起才不呆板。' },
  { id: 'c-wood', n: '大木作', tag: '柱 · 梁 · 枋', mats: ['wood', 'woodDk'], p: [-24, 5.4, 4], l: [-36, 3.6, -6], txt: '柱、梁、枋以榫卯搭成骨架，屋面的重量经它们传到柱础。木表披灰髹漆，朱红与栗壳色是江南亭榭常用的两色。' },
  { id: 'c-tile', n: '瓦作', tag: '小青瓦 · 屋脊', mats: ['tile', 'ridge'], p: [-22, 12, 8], l: [-36, 6.4, -6], txt: '小青瓦仰覆相扣铺成屋面，屋脊用瓦条与灰泥堆塑。墙顶的瓦檐、漏窗的窗芯，也都出自瓦作。' },
  { id: 'c-plaster', n: '粉墙', tag: '纸筋灰', mats: ['plaster'], p: [14, 4, -8], l: [24, 2, 0], txt: '砖墙外抹纸筋石灰，洁白而不反光，树影、竹影落在上面，就是一幅水墨。' },
  { id: 'c-lamp', n: '灯彩', tag: '宫灯 · 园灯', mats: ['lampGl', 'lantern', 'gold', 'metal', 'plaque', 'candle'], p: [-21, 5, 6], l: [-36, 3.4, -6], m: { t: 1 }, txt: '宫灯、纱灯、园灯与石塔里的烛火。入夜后它们是场景里仅有的暖色，也是水面倒影的来处。' },
  { id: 'c-rock', n: '叠石', tag: '太湖石', mats: ['rock'], p: [4.6, 2.3, 3.2], l: [8.6, 1.6, 6.6], txt: '湖石不求规整，求的是孔洞与皱褶。三五成组，主次高低，像一幅立起来的山水。' },
  { id: 'c-flora', n: '花木', tag: '四时', mats: ['willow', 'peach', 'plane', 'maple', 'ginkgo', 'camphor', 'plum', 'shrub', 'azalea', 'bamboo', 'bark', 'lotus', 'lotusFl', 'lawn', 'farTree', 'farPeach'], p: [30, 27, 38], l: [-14, 2, -4], txt: '西湖的颜色主要是花木给的：春桃柳、夏荷、秋桂与红叶、冬梅。切换时节，看它们各自登场。' },
  { id: 'c-water', n: '理水', tag: '湖面 · 倒影', parts: ['water', 'lotus', 'koi', 'lanterns'], p: [-46, 2.4, 10], l: [-70, .2, 45], txt: '大片水面是这里最大的留白。水纹、天光、倒影与灯影都由它来呈现。' },
];
const SEASON_N = ['春 · 桃红柳绿', '夏 · 风荷满池', '秋 · 丹枫金杏', '冬 · 雪霁亭桥'];
const POEMS = { 0: ['最爱湖东行不足', '绿杨阴里白沙堤', '白居易'], 1: ['接天莲叶无穷碧', '映日荷花别样红', '杨万里'], 2: ['有三秋桂子', '十里荷花', '柳永'], 3: ['天与云与山与水', '上下一白', '张岱'], rain: ['水光潋滟晴方好', '山色空蒙雨亦奇', '苏轼'], night: ['欲把西湖比西子', '淡妆浓抹总相宜', '苏轼'] };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>';
const EYEOFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18M10.6 6.2A9.6 9.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9M6.4 7.6A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.8"/></svg>';
const PINFO = {}; PGROUPS.forEach(g => g[1].forEach(p => PINFO[p[0]] = { id: p[0], n: p[1], p: p[2], l: p[3], txt: p[4], g: g[0] }));
let sel = null;

function setSeason(k, instant) { const cur = ST.season; let t = k + 4 * Math.ceil((cur - k) / 4 - 1e-9); if (instant) { ST.season = TG.season = k; } else TG.season = t; $$('#seasons button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.s === k)); $('#s-now').textContent = SEASON_N[k]; $('#wx-rain').textContent = k === 3 ? '落雪' : '烟雨'; refreshPoem(); }
function setTod(v, instant) { TG.tod = v; if (instant) ST.tod = v; $$('#tods button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.t === v)); refreshPoem(); }
function setRain(v, instant) { TG.rain = v; if (instant) ST.rain = v; $$('#wx button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.r === v)); refreshPoem(); }
const curSeason = () => ((Math.round(TG.season) % 4) + 4) % 4;
function refreshPoem() { const p = TG.rain > .5 && curSeason() !== 3 ? POEMS.rain : TG.tod >= .5 ? POEMS.night : POEMS[curSeason()]; $('#poem').innerHTML = `${p[0]}<br>${p[1]}<br><small>${p[2]}</small>`; }
function sceneTheme() { const n = ST.tod > .62; if (n !== sceneTheme.v) { sceneTheme.v = n; document.documentElement.dataset.scene = n ? 'night' : 'day'; } }

function showCard(title, tag, txt, btns) { $('#c-title').textContent = title; $('#c-tag').textContent = tag; $('#c-text').textContent = txt; const b = $('#c-btns'); b.innerHTML = ''; (btns || []).forEach(x => { const e = document.createElement('button'); e.textContent = x[0]; e.onclick = x[1]; b.appendChild(e); }); $('#card').hidden = false; }
function markSel(id) { sel = id; $$('.item').forEach(e => e.classList.toggle('on', e.dataset.id === id)); }
function setFocus(f) { ST.focus = f; applyOpacity(); }
function stopModes() { if (walk.on) stopWalk(); if (lap.on) stopLap(); }
function selectView(id, quiet) {
  const v = VIEWS.find(x => x.id === id); if (!v) return; stopModes(); setFocus(null); markSel(id);
  if (v.m) { if (v.m.s != null) setSeason(v.m.s); if (v.m.t != null) setTod(v.m.t); if (v.m.r != null) setRain(v.m.r); }
  flyTo(v.p, v.l, quiet ? .01 : 2.6); showCard(v.n, v.tag, v.txt, id === 'all' ? [] : [['回到全景', () => selectView('all')]]);
  try { history.replaceState(null, '', '#' + id); } catch (e) { }
}
function partBtns(id) { const p = PARTS[id], foc = ST.focus && ST.focus.parts && ST.focus.parts[0] === id;
  return [[foc ? '恢复全部' : '只看它', () => { setFocus(foc ? null : { parts: [id] }); selectPart(id, true); }], [p && p.visible ? '隐藏' : '显示', () => { togglePart(id); selectPart(id, true); }]]; }
function selectPart(id, stay) { const p = PINFO[id]; if (!p) return; stopModes(); if (!stay) { if (ST.focus && !(ST.focus.parts && ST.focus.parts[0] === id)) setFocus(null); flyTo(p.p, p.l, 2.2); if (id === 'pv-lamp' || id === 'glow' || id === 'lanterns' || id === 'co-lamp' || id === 'ha-lamp') setTod(1); } markSel(id); showCard(p.n, p.g + ' · 构件', p.txt, partBtns(id)); }
function togglePart(id, v) { const p = PARTS[id]; if (!p) return; setPartVisible(id, v == null ? !p.visible : v); const it = document.querySelector(`#l-parts .item[data-id="${id}"]`); if (it) { it.classList.toggle('off', !p.visible); it.querySelector('.eye').innerHTML = p.visible ? EYE : EYEOFF; it.querySelector('.eye').setAttribute('aria-label', (p.visible ? '隐藏' : '显示') + PINFO[id].n); } }
function selectCraft(id, stay) { const c = CRAFTS.find(x => x.id === id); stopModes(); const foc = ST.focus && ST.focus.id === id; if (!stay) { setFocus(Object.assign({ id }, c.parts ? { parts: c.parts } : { mats: c.mats })); flyTo(c.p, c.l, 2.4); if (c.m && c.m.t != null) setTod(c.m.t); }
  markSel(id); const on = ST.focus && ST.focus.id === id; showCard(c.n, c.tag + ' · 工艺', c.txt, [[on ? '恢复全部' : '只看这种材质', () => { setFocus(on ? null : Object.assign({ id }, c.parts ? { parts: c.parts } : { mats: c.mats })); selectCraft(id, true); }]]); }

function buildUI() {
  const lv = $('#l-views'), g = document.createElement('div'); g.className = 'grid'; lv.appendChild(g);
  VIEWS.forEach(v => { const d = document.createElement('div'); d.className = 'item'; d.dataset.id = v.id; d.innerHTML = `<button class="go">${v.n}<small>${v.tag}</small></button>`; d.firstChild.onclick = () => selectView(v.id); g.appendChild(d); });
  const lp = $('#l-parts'); PGROUPS.forEach(gr => { const h = document.createElement('div'); h.className = 'grp'; h.textContent = gr[0]; lp.appendChild(h);
    gr[1].forEach(p => { if (!PARTS[p[0]]) return; const d = document.createElement('div'); d.className = 'item'; d.dataset.id = p[0]; d.innerHTML = `<button class="go">${p[1]}</button><button class="eye" aria-label="隐藏${p[1]}">${EYE}</button>`; d.children[0].onclick = () => selectPart(p[0]); d.children[1].onclick = () => { togglePart(p[0]); if (sel === p[0]) selectPart(p[0], true); }; lp.appendChild(d); }); });
  const lc = $('#l-crafts'); CRAFTS.forEach(c => { const d = document.createElement('div'); d.className = 'item'; d.dataset.id = c.id; d.innerHTML = `<button class="go">${c.n}<small>${c.tag}</small></button>`; d.firstChild.onclick = () => selectCraft(c.id); lc.appendChild(d); });
  $$('.tabs button').forEach(b => b.onclick = () => { $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); $$('.list').forEach(l => l.classList.toggle('on', l.id === 'l-' + b.dataset.tab)); });
  $$('#seasons button').forEach(b => b.onclick = () => { cycle(false); setSeason(+b.dataset.s); });
  $$('#tods button').forEach(b => b.onclick = () => { if (walk.on) stopWalk(); setTod(+b.dataset.t); });
  $$('#wx button').forEach(b => b.onclick = () => setRain(+b.dataset.r));
  $('#op').oninput = e => { ST.opacity = e.target.value / 100; $('#op-v').textContent = e.target.value + '%'; applyOpacity(); };
  $('#a-walk').onclick = () => walk.on ? stopWalk() : startWalk();
  $('#a-cycle').onclick = () => { if (lap.on) stopLap(); cycle(!cyc.on); };
  $('#a-lap').onclick = () => lap.on ? stopLap() : startLap();
  $('#a-imm').onclick = () => setImmersive(true); $('#a-music').onclick = () => setMusic(!music.on, true); if (!BGM_B64) $('#a-music').hidden = true;
  $('#imm-exit').onclick = () => setImmersive(false);
  window.addEventListener('pointermove', () => { if (document.body.classList.contains('immersive')) pokeImm(); });
  window.addEventListener('pointerdown', () => { if (document.body.classList.contains('immersive')) pokeImm(); });
  $('#a-bell').onclick = bell;
  $('#a-reset').onclick = () => selectView('all');
  $('#a-labels').onclick = e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); $('#labels').hidden = !on; };
  $('#a-showall').onclick = () => { Object.keys(PARTS).forEach(id => { if (PINFO[id]) togglePart(id, true); else setPartVisible(id, true); }); setFocus(null); ST.opacity = 1; $('#op').value = 100; $('#op-v').textContent = '100%'; applyOpacity(); if (sel && PINFO[sel]) selectPart(sel, true); };
  $$('#mbar button').forEach(b => b.onclick = () => { const on = document.body.dataset.sheet === b.dataset.sheet; if (on) delete document.body.dataset.sheet; else document.body.dataset.sheet = b.dataset.sheet; $$('#mbar button').forEach(x => x.setAttribute('aria-pressed', !on && x === b)); });
  // 题签
  const L = $('#labels'); LABELS.forEach(a => { const v = VIEWS.find(x => x.id === a[0]), e = document.createElement('button'); e.className = 'lb'; e.textContent = v.n; e.onclick = () => selectView(v.id); L.appendChild(e); a.el = e; a.v = new V3(a[1], a[2], a[3]); });
  window.addEventListener('resize', resize);
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id !== sel && VIEWS.some(v => v.id === id)) selectView(id); });
  window.addEventListener('keydown', e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.key === 'Escape') { if (document.body.classList.contains('immersive')) setImmersive(false); else { setFocus(null); selectView('all'); } } else if (e.key === 'h' || e.key === 'H') setImmersive(!document.body.classList.contains('immersive')); else if (e.key === 'm' || e.key === 'M') setMusic(!music.on, true); });
}
const _pv = new V3();
function updateLabels() {
  if ($('#labels').hidden || document.body.classList.contains('film')) return;
  for (const a of LABELS) { _pv.copy(a.v).project(camera); const d = camera.position.distanceTo(a.v), ok = _pv.z < 1 && Math.abs(_pv.x) < 1.05 && Math.abs(_pv.y) < 1.05 && d > 9 && !walk.on;
    if (ok) { a.el.style.transform = `translate(${((_pv.x * .5 + .5) * W).toFixed(1)}px,${((-_pv.y * .5 + .5) * H - 16).toFixed(1)}px) translate(-50%,-100%)`; a.el.style.opacity = d > 1300 ? 0 : 1; a.el.style.visibility = 'visible'; } else a.el.style.visibility = 'hidden'; }
}

// 湖畔漫步：从午后的湖面，过曲桥，入亭，至入夜灯起
const KF = [[0, -34, 1, 34, -46, 2], [3, -21, 1.25, 25, -70, 1.3], [5.4, -6, 1.8, 13, -119, 0], [7.6, 5.6, 2.22, 2.2, -101, -2], [8.8, 1.2, 2.3, 0, -96, -2], [9.9, -2.4, 2.3, -.05, -100, -2], [10.8, -4.6, 2.3, -1.1, -125, -2], [11.7, -5.05, 2.3, -4.2, -135, -2], [12.6, -6.6, 2.3, -6.3, -112, -2], [13.6, -10.4, 2.3, -6.5, -82, -2], [14.5, -12.7, 2.3, -5, -55, -2], [15.4, -13.05, 2.3, -1.6, -52, -2], [16.3, -14.6, 2.3, .35, -78, -2], [17.3, -18.6, 2.3, .5, -104, -1], [18.2, -20.7, 2.3, -.9, -128, 0], [19.1, -21.05, 2.3, -4, -122, 2], [20, -22.8, 2.3, -5.9, -100, 6], [21.3, -27.5, 2.33, -6, -92, 7], [22.6, -32.2, 2.42, -6, -88, 3], [23.8, -35.2, 2.45, -4.3, -66, -1], [25.2, -36.2, 2.38, -2.2, -82, -2], [26.6, -37.6, 1.8, 2.5, -114, -2], [28, -39, 1.3, 8, -152, -1], [29.5, -40, 1.05, 13.5, -186, 2], [31, -40.6, 1, 17, -197, 5]];
const walkCurve = new THREE.CatmullRomCurve3(KF.map(k => new V3(k[1], k[2], k[3])), false, 'centripetal');
const WALK_T = KF[KF.length - 1][0];
const cr = (a, b, c, d, t) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
const walkTod = t => t < 14 ? lerp(0, .14, t / 14) : t < 23 ? lerp(.14, .5, sstep(14, 23, t)) : t < 27.6 ? lerp(.5, 1, (t - 23) / 4.6) : 1;
const walk = { on: false, t: 0, p: new V3(), l: new V3() };
function walkRaw(t) {
  t = clamp(t, 0, WALK_T - 1e-4); let i = 0; while (i < KF.length - 2 && KF[i + 1][0] <= t) i++;
  const f = (t - KF[i][0]) / (KF[i + 1][0] - KF[i][0]), n = KF.length - 1, K = j => KF[clamp(j, 0, n)], p = walkCurve.getPoint((i + f) / n);
  return [p.x, p.y, p.z, cr(K(i - 1)[4], K(i)[4], K(i + 1)[4], K(i + 2)[4], f), cr(K(i - 1)[5], K(i)[5], K(i + 1)[5], K(i + 2)[5], f)];
}
// 预先按时间做高斯平滑：抹掉关键帧处的速度突变和过快的转头
const WT = (() => { const n = Math.round(WALK_T * 60) + 1, raw = [], out = [], sg = 34, w = []; for (let i = 0; i < n; i++) raw.push(walkRaw(i / 60));
  for (let k = -sg * 3; k <= sg * 3; k++) w.push(Math.exp(-k * k / (2 * sg * sg))); const ws = w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < n; i++) { const o = [0, 0, 0, 0, 0]; for (let k = -sg * 3; k <= sg * 3; k++) { const r = raw[clamp(i + k, 0, n - 1)], g = w[k + sg * 3] / ws; for (let c = 0; c < 5; c++) o[c] += r[c] * g; } out.push(o); } return out; })();
function walkAt(t) {
  const x = clamp(t, 0, WALK_T) * 60, i = Math.min(Math.floor(x), WT.length - 2), f = x - i, a = WT[i], b = WT[i + 1], yaw = lerp(a[3], b[3], f) * PI / 180, pit = lerp(a[4], b[4], f) * PI / 180;
  walk.p.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
  walk.l.set(walk.p.x + Math.sin(yaw) * Math.cos(pit) * 10, walk.p.y + Math.sin(pit) * 10, walk.p.z + Math.cos(yaw) * Math.cos(pit) * 10);
  CAM.free = { p: walk.p, l: walk.l }; CAM.fly = null; ST.tod = TG.tod = walkTod(t);
}
function startWalk() { cycle(false); if (lap.on) stopLap(); setFocus(null); walk.on = true; walk.t = 0; $('#a-walk').setAttribute('aria-pressed', true); $('#a-walk').textContent = '结束漫步'; $('#card').hidden = false; showCard('湖畔漫步', '从午后走到入夜', '镜头贴着湖面靠岸，踏上九曲桥，一折一景走进亭中；日头西沉，灯一盏盏亮起来，最后回望水里的亭影。拖动画面可随时接管视角。', [['结束漫步', stopWalk]]); markSel(null); }
function stopWalk() { if (!walk.on) return; walk.on = false; $('#a-walk').setAttribute('aria-pressed', false); $('#a-walk').textContent = '湖畔漫步'; if (CAM.free) { const o = poseToOrbit(walk.p.toArray(), walk.l.toArray()); CAM.free = null; Object.assign(CAM.d, { th: o.th, ph: o.ph, r: o.r }); CAM.d.t.copy(o.t); CAM.t.copy(o.t); CAM.th = o.th; CAM.ph = o.ph; CAM.r = o.r; } setTod(ST.tod > .75 ? 1 : ST.tod > .3 ? .5 : 0); }
// 环湖一周：沿湖心一侧的闭合航线匀速飞行，东岸起春、南岸入夏、西堤逢秋、北岸落雪，回到东岸又是一春
const LAP = [[-75, 16, 10], [-62, 22, 150], [-110, 30, 310], [-225, 34, 400], [-390, 26, 360], [-480, 22, 200], [-500, 20, 0], [-492, 22, -200], [-460, 26, -400], [-385, 28, -470], [-225, 22, -496], [-85, 20, -545], [-28, 24, -380], [-58, 20, -160]];
const lapCurve = new THREE.CatmullRomCurve3(LAP.map(p => new V3(p[0], p[1], p[2])), true, 'centripetal'), LAP_T = 180, _la = new V3();
const SIGHTS = [['集贤亭 · 九曲桥', -36, -6], ['雷峰塔', -330, 560], ['净慈寺 · 南屏晚钟', -128, 560], ['小瀛洲 · 三潭印月', -215, 70], ['苏堤', -545, 250], ['苏堤', -575, -150], ['阮公墩', -410, -110], ['湖心亭', -300, -231], ['孤山', -360, -560], ['平湖秋月', -176, -548], ['白堤', -80, -600], ['断桥', 5, -638]];
const lap = { on: false, t: 0, cap: '' };
function lapAt(u) {
  u = ((u % 1) + 1) % 1; lapCurve.getPointAt(u, walk.p); lapCurve.getPointAt((u + .05) % 1, _la);
  const ox = _la.x + 280, oz = _la.z + 80, ol = Math.hypot(ox, oz) || 1; walk.l.set(_la.x + ox / ol * 42, 6, _la.z + oz / ol * 42);
  CAM.free = { p: walk.p, l: walk.l }; CAM.fly = null; ST.season = TG.season = u * 4;
}
function startLap() { if (music.pref !== false) setMusic(true); cycle(false); if (walk.on) stopWalk(); setFocus(null); lap.on = true; $('#a-lap').setAttribute('aria-pressed', true); $('#a-lap').textContent = '结束环湖'; markSel(null); $('#card').hidden = true; }
function stopLap() { if (!lap.on) return; lap.on = false; $('#a-lap').setAttribute('aria-pressed', false); $('#a-lap').textContent = '环湖一周'; $('#cap').style.opacity = 0; lap.cap = '';
  if (CAM.free) { const o = poseToOrbit(walk.p.toArray(), walk.l.toArray()); CAM.free = null; Object.assign(CAM.d, { th: o.th, ph: o.ph, r: o.r }); CAM.d.t.copy(o.t); CAM.t.copy(o.t); CAM.th = o.th; CAM.ph = o.ph; CAM.r = o.r; }
  const k = ((Math.round(ST.season) % 4) + 4) % 4; ST.season = ((ST.season % 4) + 4) % 4; TG.season = ST.season; setSeason(k); }
// 沉浸模式：隐藏全部界面，只留画面；移动鼠标或轻点时角上浮出“显示界面”
let immT = 0;
function setImmersive(on) { document.body.classList.toggle('immersive', on); $('#a-imm').setAttribute('aria-pressed', on); if (on) { pokeImm(); if (music.pref !== false) setMusic(true); } }
function pokeImm() { const e = $('#imm-exit'); e.classList.add('show'); clearTimeout(immT); immT = setTimeout(() => e.classList.remove('show'), 2600); }
const cyc = { on: false, t: 0 };
function cycle(on) { cyc.on = on; cyc.t = 0; $('#a-cycle').setAttribute('aria-pressed', on); }

let AC = null;
// 配乐：原创《湖上四时》长版（video/bgm.py 合成）。一遍约 104 秒，前后两遍交叠 4.5 秒循环；手动关过就不再自动响起
const music = { on: false, pref: null, buf: null, gain: null, timer: 0, srcs: [], loading: 0 };
function setMusic(on, byUser) {
  if (!BGM_B64 || WL.film) return; if (byUser) music.pref = on; if (on === music.on) return; music.on = on; const bt = $('#a-music'); bt.setAttribute('aria-pressed', on); bt.textContent = on ? '配乐 · 开' : '配乐';
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    if (!music.gain) { music.gain = AC.createGain(); music.gain.gain.value = 0; music.gain.connect(AC.destination); }
    const g = music.gain.gain, t = AC.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(on ? .85 : 0, t + (on ? 1.2 : .8));
    if (on) { if (music.buf) musicLoop(); else if (!music.loading) { music.loading = 1; const bin = atob(BGM_B64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); AC.decodeAudioData(u8.buffer, b => { music.buf = b; if (music.on) musicLoop(); }, () => { music.loading = 0; }); } }
    else { clearTimeout(music.timer); const ss = music.srcs; music.srcs = []; setTimeout(() => ss.forEach(s => { try { s.stop(); } catch (e) { } }), 900); }
  } catch (e) { }
}
function musicLoop(at) { const b = music.buf, t = Math.max(at || 0, AC.currentTime + .05), s = AC.createBufferSource(); s.buffer = b; s.connect(music.gain); s.start(t); music.srcs.push(s); s.onended = () => { music.srcs = music.srcs.filter(x => x !== s); };
  const next = t + b.duration - 4.5; clearTimeout(music.timer); music.timer = setTimeout(() => { if (music.on) musicLoop(next); }, Math.max(0, (next - AC.currentTime - 1.5) * 1000)); }
function bell() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t = AC.currentTime + .02, out = AC.createGain(), lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; out.gain.value = .5; out.connect(lp); lp.connect(AC.destination);
    [[1, 1, 10], [2.0, .5, 8], [2.76, .34, 6], [3.3, .2, 4.5], [4.14, .12, 3], [5.43, .07, 2]].forEach(([m, a, d]) => { [0, .7].forEach(det => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 98 * m + det; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * .5, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .1); }); });
  } catch (e) { }
}

WL.onTap = (cx, cy) => { const p = pickWater(cx, cy); if (!p) return; addRipple(p[0], p[1], 1); feed = { x: p[0], z: p[1], t: WL.time }; if (ENV.night > .5) releaseLantern(p[0], p[1]); };
WL.onUserMove = () => { if (walk.on) stopWalk(); if (lap.on) stopLap(); };
WL.tick = (dt, t) => {
  if (walk.on) { walk.t += dt * .62; walkAt(walk.t); if (walk.t >= WALK_T) { stopWalk(); selectView('ting'); setTod(1); } if (Math.floor(walk.t * 1.3) !== Math.floor((walk.t - dt * .62) * 1.3) && walk.t > 8.6 && walk.t < 23) { /* 脚边的水纹 */ addRipple(walk.p.x + rr(-3, 3), walk.p.z + rr(-3, 3), .35); } }
  if (lap.on) { lap.t += dt; lapAt(lap.t / LAP_T); let best = '', bd = 230; for (const s of SIGHTS) { const d = Math.hypot(s[1] - walk.p.x, s[2] - walk.p.z); if (d < bd) { bd = d; best = s[0]; } }
    if (best !== lap.cap) { lap.cap = best; const c = $('#cap'); c.style.opacity = 0; clearTimeout(lap.ct); if (best) lap.ct = setTimeout(() => { c.textContent = best; c.style.opacity = 1; }, 600); } }
  if (cyc.on) { if (!CAM.fly && !CAM.free && !walk.on) CAM.d.th += dt * .1; cyc.t += dt; if (cyc.t > 4.6 && ST.season === TG.season) { cyc.t = 0; setSeason((curSeason() + 1) % 4); } }
  if (ST.rain > .5 && Math.random() < dt * 2.5) { camera.getWorldDirection(_fw); addRipple(camera.position.x + _fw.x * 14 + rr(-10, 10), camera.position.z + _fw.z * 14 + rr(-10, 10), .3); }
  sceneTheme();
};
WL.post = updateLabels;

// 影片接口：逐帧驱动
WL.step = dt => frame(dt);
// 影片分镜（全部为解析式的连续运动，逐帧可重复）：
// 0–21.5 s 自北面湖上旋入、绕亭桥半周，四季依次流转；21.5–28 s 亭中看日落、灯起；28–36 s 夜色里绕亭回望灯影
WL.FILM_T = 36;
function filmPose(t) {
  if (t < 21.5) { const tau = 3, Om = 168 / (21.5 - tau * (1 - Math.exp(-21.5 / tau))) * PI / 180, th = -178 * PI / 180 + Om * (t - tau * (1 - Math.exp(-t / tau))), r = 38 + 40 * Math.exp(-t / 5);
    return { p: [-22 + r * Math.sin(th), 9.5 - 3.5 * Math.exp(-t / 5), -3 + r * Math.cos(th)], l: [-22, 2.5, -3], season: clamp((t - 5.5) / 4, 0, 3), tod: 0, rain: sstep(17.2, 19.2, t) * .85, sh: [-18, -3, 66] }; }
  if (t < 28) { const u = (t - 21.5) / 6.5; return { p: [lerp(-33.5, -35.7, u), 2.42, lerp(-7, -4.5, u)], l: [-231.6, 5, 35.6], season: 0, tod: lerp(.45, .87, u), rain: 0, sh: [-36, -6, 30] }; }
  const u = (t - 28) / 8, th = (-35 + 40 * u) * PI / 180, r = 25 + 5 * u; return { p: [-36 + r * Math.sin(th), 1.3 + .4 * u, -6 + r * Math.cos(th)], l: [-35, 3.7, -6], season: 0, tod: 1, rain: 0, sh: [-30, -6, 40] };
}
const FILM_SEASON = [['春', '桃红柳绿', 3.6, 6.6], ['夏', '风荷满池', 8.6, 11.4], ['秋', '丹枫金杏', 12.6, 15.4], ['冬', '雪落亭桥', 16.6, 20.6]];
let filmLit = false;
WL.filmFrame = (t, dt) => {
  const q = filmPose(t); walk.p.fromArray(q.p); walk.l.fromArray(q.l); CAM.free = { p: walk.p, l: walk.l }; CAM.fly = null;
  ST.season = TG.season = q.season; ST.tod = TG.tod = q.tod; ST.rain = TG.rain = q.rain; WL.shadowFix = q.sh;
  if (t >= 28 && !filmLit) { filmLit = true; [[-38, 3], [-35, 5.5], [-41, 6.5], [-33, 8], [-37.5, 9.5], [-44, 4.5], [-31, 4.5], [-39.5, 12], [-29.5, 10], [-46, 9], [-34.5, 13], [-42.5, 14.5], [-27, 6.5], [-48.5, 13]].forEach(p => releaseLantern(p[0], p[1])); }
  const F = $('#film'), Q = c => F.querySelector(c), o = (a, b, c, d) => clamp(Math.min((t - a) / (b - a), (d - t) / (d - c)), 0, 1);
  Q('.t1').style.opacity = o(.5, 1.4, 2.6, 3.3); Q('.t2').style.opacity = o(.8, 1.7, 2.6, 3.3); Q('.s1').style.opacity = o(1.1, 1.9, 2.6, 3.3);
  let sk = 0; for (const s of FILM_SEASON) { const k = o(s[2], s[2] + .6, s[3] - .6, s[3]); if (k > 0) { sk = k; if (Q('.sn').textContent !== s[0]) { Q('.sn').textContent = s[0]; Q('.sd').textContent = s[1]; } } }
  Q('.sn').style.opacity = sk; Q('.sd').style.opacity = sk;
  Q('.e1').style.opacity = clamp((t - 31.8) / 1.3, 0, 1); Q('.e2').style.opacity = clamp((t - 32.5) / 1.3, 0, 1);
  const fb = Math.max(clamp(1 - t / .9, 0, 1), o(27.6, 28, 28, 28.45), clamp((t - (WL.FILM_T - .75)) / .7, 0, 1)), fw = o(21, 21.5, 21.5, 22.05);
  Q('.fade').style.background = fw > fb ? '#e9eef0' : '#0a1014'; Q('.fade').style.opacity = Math.max(fb, fw);
  frame(dt);
};

function init() {
  // 分批合并上传，避免一次攒下全部顶点数据
  const fl = () => B.flush(world).forEach(m => { const p = m.userData.part; if (p.startsWith('far-')) { m.castShadow = false; m.receiveShadow = false; } else if (p === 'north' || p === 'temple') m.castShadow = false; });
  buildShore(); buildBridge(); buildPavilion(); buildCorridor(); buildHall(); buildArchBridge(); buildWall(); buildFacilities(); fl(); buildFlora(); fl(); buildFar(); fl(); buildLake(); fl();
  ['shrubs', 'bench', 'rockery', 'wall', 'bamboo', 'path', 'lawn'].forEach(id => PARTS[id] && PARTS[id].meshes.forEach(m => hideInRefl.push(m)));   // 倒影里看不到的部件不必再画一遍
  buildLotus(); buildKoi(); buildBoat(bankX(20) - 2.5, 21.3, PI / 2 + .12); buildBoat(bankX(26) - 3.2, 28.5, PI / 2 - .3);
  buildLanterns(); buildGlow();
  buildUI(); resize(); setSeason(0, true); setTod(0, true); setRain(0, true); applyEnv(); applyOpacity();
  if (WL.film) { document.body.classList.add('film'); const F = $('#film'); F.querySelector('.t1').textContent = '西湖'; F.querySelector('.t2').textContent = '四时环游　曲桥　亭廊　灯影'; F.querySelector('.s1').textContent = '湖畔'; F.querySelector('.e1').textContent = '灯影入湖'; F.querySelector('.e2').textContent = '西湖湖畔 · 四时皆可游'; }
  const h = location.hash.slice(1); const v0 = VIEWS.find(v => v.id === h);
  if (v0 && v0.id !== 'all') { selectView(v0.id, true); } else { CAM.d.r = 96; CAM.r = 96; selectView('all'); $('#card').hidden = true; }
  frame(.016); $('#veil').classList.add('off'); WL.ready = true; requestAnimationFrame(loop);
}
requestAnimationFrame(() => setTimeout(() => { try { init(); } catch (e) { console.error(e); $('#veil').textContent = '场景加载失败：' + e.message; } }, 30));
WL.api = { lapAt, startLap, setImmersive, setMusic, music, selectView, selectPart, selectCraft, setSeason, setTod, setRain, walkAt, flyTo, togglePart, setFocus, filmPose, CAM, ST, TG, ENV };
WL.sync = () => { const gl = renderer.getContext(), px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return px[0]; };
WL.info = () => ({ tris: renderer.info.render.triangles, calls: renderer.info.render.calls, meshes: MESHES.length, mats: MATS.length });
WL.r = renderer; WL.water = water;
WL.dbg = { MESHES, MATS, PARTS, sun, scene, sky, FL, lanterns, rip, koi };
