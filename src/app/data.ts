export interface Data {
  id: string;
  name: string;
  image: string;
  description: string;
  category: 'animal' | 'food';
}

const list: Data[] = [
  {
    id: 'rabbit',
    name: '小兔子',
    image: 'assets/images/rabbit.png',
    description: '这是一只小兔子',
    category: 'animal'
  }, {
    id: 'dog',
    name: '小狗',
    image: 'assets/images/dog.png',
    description: '这是一只小狗',
    category: 'animal'
  }, {
    id: 'cat',
    name: '小猫',
    image: 'assets/images/cat.png',
    description: '这是一只小猫',
    category: 'animal'
  }
];

export {
  list
}
