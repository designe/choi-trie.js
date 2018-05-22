CHOI-TRIE
=============

## Introduction
The CHOI-TRIE is writed on javascript.  
Basically, it is based on radix-trie.   
I'd like to make it more fast and lightweight. it will evolve day by day.  
Anyway, If you want to use choi-trie, feel free to download and use it.

## How to Use
1) Load library by html script tag
```html
<script src="http://api.jbear.co/lib/choi-trie/choi-trie-0.2.8.min.js" integrity="sha384-NT9jxgfbAg/9YjUvAiOw29O//ohwpYQTmbOPwLlLIU+NxGRxVd4rbhv4paO47tSY" crossorigin="anonymous"></script>
```

2) Use CHOI-TRIE
```js
// initialization
var source = {};
var myTrie = new ChoiTrie();
myTrie.setRoot(source);


// Add words.
myTrie.add("Hello, Choi-Trie", 1);
myTrie.add("This is example for using Choi-Trie", 2);
myTrie.add("Thank you for use it", 3);

myTrie.search("Choi-Trie");
/*
Query(Choi-Trie) result is 1
*/
```

## License
CHOI-TRIE is licensed under the [MIT license.] (https://raw.githubusercontent.com/designe/choi-trie.js/master/LICENSE)

