export interface Data {
  id: string;
  name: string;
  image: string;
  category: '动物' | '食物' | '人物' | '玩具';
}

const list: Data[] = [
  {
    id: 'rabbit',
    name: '小兔子',
    image: 'assets/images/rabbit.png',
    category: '动物'
  }, {
    id: 'dog',
    name: '小狗',
    image: 'assets/images/dog.webp',
    category: '动物'
  }, {
    id: 'cat',
    name: '小猫',
    image: 'assets/images/cat.webp',
    category: '动物'
  }, {
    id: 'orangutan',
    name: ' orangutan',
    image: 'assets/images/orangutan.webp',
    category: '动物'
  }, {
    id: 'bee',
    name: '蜜蜂',
    image: 'assets/images/bee.webp',
    category: '动物'
  }, {
    id: 'dinosaur',
    name: '恐龙',
    image: 'assets/images/dinosaur.webp',
    category: '动物'
  }, {
    id: 'lion',
    name: '狮子',
    image: 'assets/images/lion.webp',
    category: '动物'
  }, {
    id: 'panda',
    name: '熊猫',
    image: 'assets/images/panda.webp',
    category: '动物'
  }, {
    id: 'panda',
    name: '熊猫',
    image: 'assets/images/panda2.webp',
    category: '动物'
  }, {
    id: 'orangutan',
    name: '大猩猩',
    image: 'assets/images/orangutan.webp',
    category: '动物'
  }, {
    id: 'peacock',
    name: '孔雀',
    image: 'assets/images/peacock.png',
    category: '动物'
  }, {
    id: 'snail',
    name: '蜗牛',
    image: 'assets/images/snail.png',
    category: '动物'
  }, {
    id: 'squirrel',
    name: '松鼠',
    image: 'assets/images/squirrel.webp',
    category: '动物'
  }, {
    id: 'bumblebee',
    name: '大黄蜂',
    image: 'assets/images/bumblebee.png',
    category: '玩具'
  }
];

export {
  list
}
