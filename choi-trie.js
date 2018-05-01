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
            VERSION : '0.2',
            AUTHOR : "jbear"
        };

        var T = this;
        
        T.BUCKET_START_POINT = 8;

        this.node = function(_word, _what){
            var _H = "";
            var _I = [];

            if(_what){
                _H += _word.length + _word;
                _I.push(_what);
            }
            return {
                "C" : "", // first Characters are saved here. (C & O)
                "H" : _H, // Hash bucket (H & I)
                "O" : [], // generic nOde 
                "I" : _I, // result of retrIeval
                "length" : _I.length,
                "select" : function (_word) {
                    if(this.C) {
                        return this.select_c(_word) * -1;
                    } else if(this.H) {
                        return this.select_h(_word);
                    }
                    return 0;
                },
                "select_c" : function(_char) {
                    for(var i = 0 ; i < this.C.length; i++) {
                        if(_char[0] === this.C[i])
                            return i;
                    }

                    return -1;
                },
                "select_h" : function(_word) {
                    var idx = 0;
                    var bucket_idx = 0;
                    var bucket = this.H;
                    while(bucket_idx != this.H.length) {
                        if(_word.length == bucket[bucket_idx]) {
                            var isFound = true;
                            for(var i = 0; i < _word.length; i++, bucket_idx++) {
                                if(_word[i] != bucket[bucket_idx]) {
                                    isFound = false;
                                    bucket_idx += _word.length - i;
                                }
                            }

                            if(isFound) return idx;
                            else idx++;
                        } else idx++;
                    }

                    return -1;
                },
                "get_h" : function(_idx) {
                    var h_idx = 0;
                    var ret = 0;

                    if(!this.H) return -1;
                    
                    while(h_idx < this.H.length) {
                        if(_idx == ret)
                            return this.H.substr(h_idx + 1, this.H[h_idx]);
                        if(this.H[h_idx]) {
                            h_idx += (parseInt(this.H[h_idx]) + 1);
                            ret++;
                        } else return -1;
                    }
                    return -1;
                },
                "pop_h" : function(_idx) {
                    var h_idx = 0;
                    var ret = 0;

                    if(!this.H) return -1;
                    
                    while(h_idx < this.H.length) {
                        if(_idx == ret){
                            var pop_front = this.H.substr(0, h_idx);
                            var pop = this.H.substr(h_idx + 1, this.H[h_idx]);
                            var pop_end = this.H.substr(h_idx + parseInt(this.H[h_idx]) + 1, this.H.length);
                            this.H = pop_front + pop_end;
                            this.I.splice(_idx, 1);
                            return pop;
                        }
                        if(this.H[h_idx]) {
                            h_idx += (parseInt(this.H[h_idx]) + 1);
                            ret++;
                        } else return -1;
                    }
                    return -1;
                },
                "removePrefix" : function(_prefix) {
                    if(this.length < this.BUCKET_START_POINT) {
                        var h_idx = 0;
                        this.H = this.H.split("");
                        
                        while(h_idx < this.H.length) {
                            var word_length = parseInt(this.H[h_idx]);
                            if(word_length >= _prefix.length){
                                var isSamePrefix = true;
                                for(var i = 0; i < _prefix.length; i++) {
                                    if(this.H[h_idx + 1 + i] != _prefix[i]) {
                                        isSamePrefix = false;
                                    }
                                }

                                // Remove prefix
                                if(isSamePrefix) {
                                    this.H[h_idx] = word_length - _prefix.length;
                                    for(var i = 1; i < _prefix.length; i++) {
                                        delete this.H[h_idx + i];
                                    }
                                }
                            }
                            
                            h_idx += word_length + 1;
                        }
                    } else {
                        // removePrefix on C ..
                    }
                },
                "rank" : function(_word) { }
            };
        };
        
        T.root = new this.node();
    }
    
    ChoiTrie.prototype = {
        setRoot: function(_root) {
            var T = this;
            if(_root.constructor !== Array){
                _root = [];
            }
            
            T.root.O = _root;
        },
        add: function(_word, _what) {
            return this.addInternal(this.root, _word, _what);
        },
        addInternal: function(_root, _word, _what) {
            var self = this;
            var current = _root;

            // Hash bucket added
            if(current.length < self.BUCKET_START_POINT) {
                current.H += _word.length + _word;
                current.I.push(_what);
            } // Character added
            else {
                var h_idx = 0;
                while(current.H) {
                    var c_idx = current.select_c(current.H[1]);
                    if(c_idx != -1) {
                        var bucket = current.pop_h(0);
                        var maximum_idx = 0;
                        var maximum_key = null;
                        for(var _key in current.O[c_idx]) {
                            var min_length = (bucket.length > _key.length) ? _key.length : bucket.length;
                            for(var i = 0; i < min_length; i++) {
                                if(_key[i] == bucket[i]) {
                                    if(maximum_key == null || maximum_idx < i) {
                                        maximum_idx = i;
                                        maximum_key = _key;
                                    }
                                }
                            }
                        }
                        console.log(`${maximum_key}, ${maximum_idx}`);
                        
                        current.O[c_idx][maximum_key.substr(0, maximum_idx)] = current.O[c_idx][maximum_key];
                        delete current.O[c_idx][maximum_key];
                    } else { // new one
                        current.C += current.H[1];
                        current.O.push({});
                        current.O[current.O.length - 1][current.pop_h(0)] = new self.node(_what);
                    }
                    
                    for(var i = 1; i <= current.H[0]; i++) {
                        
                    }
                }
            }

            current.length++;
            
        },
        /*
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
                                var subword = _word.substr(prefix_length, _word.length - prefix_length);
                                current[prefix][subword] = {};
                                current[prefix][subword].__object$ = [];
                                current[prefix][subword].__object$.push(_what);
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
        },*/
        search: function(_query) {
            var self = this;
            var _queryResult = [];

            var prefix = null;
            var _current = self.root;
            var _query_instance = _query;
            var _query_instance_length = _query_instance.length;

            var found_check = false;
            console.log(_current);
            
            /*
              Exact Prefix Matching implementation
            */
            
            while(_query_instance_length != 0){
                prefix = _query_instance.substr(0, _query_instance_length);
                console.log(`PREFIX MATCHING : ${prefix}, ${_current[prefix]}`);
                if(_current[prefix]) {
                    _query_instance = _query_instance.substr(prefix.length, _query_instance.length - prefix.length);
                    _query_instance_length = _query_instance.length;

                    console.log(`PREFIX MATCHING : ${_query_instance}, ${_query_instance_length}, ${_current.__object$}`);
                    if(_query_instance_length == 0 &&
                       _current.__object$ &&
                       _current.__object$.length > 0)
                    {
                        found_check = true;
                        console.log(`${prefix}, ${_current.__object$}`);
                        break;
                    } else {
                        _current = _current[prefix];
                        console.log(_current);
                    }
                } else {
                    _query_instance_length--;
                }
            }

            /*
              After Prefix Exact Matching, Full Search Operation.
             */
            var keysArray = Object.keys(_current);
            
            if(found_check) {
                keysArray = [];
                keysArray.push(prefix);
            }
            
            console.log(`SOME START : query = ${_query}, prefix = ${prefix}, current = ${JSON.stringify(_current)}`);

            var _temp = "";
            keysArray.some(function(_key) {
                _temp += _key + " / ";
            }); // keysArray.some finished
            console.log(_temp);
            console.log("SOME END");
            /*
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
                                    var obj = _current[queue_result[front]][k].__object$;
                                    console.log(obj);
                                    if(obj.length > 0){
                                        for(var i = 0; i < obj.length; i++) {
                                            _queryResult.push(obj[i]);
                                        }
                                    }
                                    end++;
                                }
                            }

                            if(_current[queue_result[front]])
                                _current = _current[queue_result[front]];
                            
                            front++;

                        } while(front != end);

                    } else {
                        
                    }
                }
            });*/
            
            console.log("RESULT");
            console.log(_queryResult);

            return _queryResult;
        } // end of search function
    };

    return ChoiTrie;
}());
