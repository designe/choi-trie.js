/**
 *
 * choi-trie; trie for choi (based on radix-trie)
 *
 * Author : jbear; JI-WOONG CHOI
 * Contact : http://jbear.co
 * Copyright @ jbear
 *
**/

export var ChoiTrie = (function() {
    function ChoiTrie() {
        var about = {
            VERSION : '0.1',
            AUTHOR : "jbear"
        };
        this.root = {};
    }
    
    ChoiTrie.prototype = {
        setRoot: function(_root) {
            this.root = _root;
        },
        add: function(_word, _what) {
            return this.addInternal(this.root, _word, _what);
        },
        addInternal: function(_root, _word, _what) {
            var self = this;
            var current = _root;

            console.log(`log : ${self.root}, ${_word}, ${JSON.stringify(_what)}`);
            var prefix = null;
            var prefix_length = 0;
            for(var i = _word.length; i >= 1; i--) {
                var subword = _word.substr(0, i);
                if(current[subword]) {
                    prefix = subword;
                    prefix_length = i;
                    break;
                }
            }

            if(prefix) {
                //console.log(`1 log : ${prefix}`);
                if(prefix_length != _word.length)
                    self.addInternal(current[prefix], _word.substr(prefix_length, _word.length), _what);
                else
                    if(current[prefix].__object$)
                        current[prefix].__object$.push(_what);
            }
            else {
                //console.log(`2 log : ${_word}`);
                var rootKeys = null;//Object.keys(current);
                if(current.__object$) {
                    var current_temp = Object.assign({}, current);
                    delete current_temp.__object$;
                    rootKeys = Object.keys(current_temp);
                } else {
                    rootKeys = Object.keys(current);
                }

                var found_check = false;
                if(rootKeys.length > 0) {
                    rootKeys.some(function(_key) {
                        if(_key[0] == _word[0]) {
                            found_check = true;
                            
                            prefix = _key[0];
                            prefix_length = 1;
                            for(; prefix_length < _key.length; prefix_length++) {
                                if(_key[prefix_length] != _word[prefix_length]){
                                    prefix = _word.substr(0, prefix_length);
                                    break;
                                }
                            }

                            console.log(`${prefix}, ${_key}, ${_word}`);
                            current[prefix] = {};
                            current[prefix][_key.substr(prefix_length, _key.length - prefix_length)] = current[_key];
                            delete current[_key];

                            if(prefix.localeCompare(_word)){
                                current[prefix][_word.substr(prefix_length, _word.length - prefix_length)] = {};
                                current[prefix][_word.substr(prefix_length, _word.length - prefix_length)].__object$ = _what;
                            }else
                                current[prefix].__object$ = _what;
                            
                        }
                    });
                }

                if(!found_check){
                    current[_word] = {};
                    current[_word].__object$ = [];
                    current[_word].__object$.push(_what);
                }
            }
        },
        search: function(_query) {
            var self = this;
            var _queryResult = [];
            
            var _current = self.root;
            var _query_instance = _query;
            var _query_instance_length = _query_instance.length;

            var found_check = false;

            /*
              Exact Matching implementation
            */
            while(_query_instance_length != 0){
                var prefix = _query_instance.substr(0, _query_instance_length);
                if(_current[prefix]) {
                    _current = _current[prefix];

                    _query_instance = _query_instance.substr(prefix.length, _query_instance.length - prefix.length);
                    _query_instance_length = _query_instance.length;
                    
                    if(_query_instance_length == 0){
                        found_check = true;
                        console.log(`${prefix}, ${_current.__object$}`);
                        break;
                    }
                } else {
                    _query_instance_length--;
                }
            }

            /*
             */
            if(!found_check) {
                _current = self.root;

                var keysArray = Object.keys(_current);
                keysArray.some(function(_key) {
                    if(_query[0] == _key[0]) {
                        found_check = true;

                        var min_length = (_query.length > _key.length) ? _key.length : _query.length;
                        for(var i = 1; i < min_length; i++) {
                            if(_query[i] != _key[i])
                                found_check = false;
                        }

                        console.log(`${min_length}, ${found_check}`);
                        // is Exact Prefix Matching ?
                        if(found_check) {
                            // full search on prefix
                            var queue_result = [];
                            var front = 0;
                            var end = 1;
                            queue_result.push(_key);
                            if(_current[_key].__object$){
                                for(var i = 0; i < _current[_key].__object$.length; i++) {
                                    _queryResult.push(_current[_key].__object$[i]);
                                }
                            }
                            do {
                                for(var k in _current[queue_result[front]]) {
                                    console.log("key = " + k);
                                    console.log(queue_result);
                                    if(k.localeCompare("__object$")) {
                                        queue_result.push(k);
                                        if(_current[queue_result[front]][k].__object$)
                                            _queryResult.push(_current[queue_result[front]][k].__object$);
                                        
                                        end++;
                                    }
                                }

                                if(_current[queue_result[front]])
                                {
                                    _current = _current[queue_result[front]];
                                    console.log(`${front} , ${end}, ${queue_result[front]}, ${JSON.stringify(_current)}`);
                                }
                                
                                front++;

                            } while(front != end);

                            console.log(_queryResult);
                            return _queryResult;
                        } else {
                        }
                    }
                });
            }
            
        }
    };

    return ChoiTrie;
}());
