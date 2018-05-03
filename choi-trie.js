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

        T.CACHING_COUNTING = 3;
        T.BUCKET_START_POINT = 8;

        this.node = function(_word, _what){
            var _H = "";
            var _I = [];

            if(_what){
                _H += _word.length + _word;
                _I.push(_what);
            }
            return {
                "C" : "", // Caching(first characeters) are saved here. (C & O)
                "H" : _H, // Hash bucket (H & I)
                "O" : [], // generic nOde 
                "I" : _I, // result of retrIeval
                "CC" : [], // Caching Counting
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
                "add_O" : function(_word, _what) {
                    var c_idx = this.select_c(_word[0]);

                    if(c_idx != -1) {
                        var co = this.O[c_idx];
                        var maximum_idx = 0;
                        var maximum_key = null;
                        for(var key in co) {
                            var min_length = (_word.length > key.length) ? key.length : _word.length;
                            for(var i = 0; i < min_length; i++) {
                                if(key[i] == _word[i]) {
                                    if(maximum_key == null || maximum_idx < i) {
                                        maximum_idx = i;
                                        maximum_key = key;
                                    }
                                }
                            }
                        }

                        if(maximum_key) {
                            var _obj = co[maximum_key];
                            console.log(`current : ${JSON.stringify(current)}, maximum_key : ${maximum_key}, maximum_idx : ${maximum_idx}, _obj : ${JSON.stringify(_obj)}`);
                            self.addInternal(_obj, _word.substr(maximum_idx + 1, _word.length), _what);
                        } else {
                            console.log("maximum_key가 없는 케이스가 있나?!");
                        }
                    } else {
                        this.C += _word[0];
                        c_idx = this.O.push({}) - 1;
                        var co = current.O[c_idx];
                        co[prefix] = new self.node(_what);
                    }
                },
                "add_C" : function(_char) {
                    var idx = this.select_c(_char);

                    if(idx != -1){
                        this.cachintIt(idx);
                        return idx;
                    }
                    else{
                        this.C += _char;
                        this.CC.push(0);
                        return this.CC.length -1;
                    }
                },
                "cachingIt" : function (_idx) {
                    this.CC[_idx]++;
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
                            //this.I.splice(_idx, 1);
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

            /* 
               addInternal Process
               1) Character Caching check ( Caching Condition : CACHING_COUNTING > 3 )
               2) if word's cache counting is CACHING_COUNTING, moveH2O
               3) if word is satisfied with the caching counting, add O
               4) if word is not satisfied with that condition, add H
            */

            // 1) Character Caching check
            var c_idx = this.add_C(_word[0]);
            // 2) moveH2O
            if(this.CC[c_idx] == this.CACHING_COUNTING) {
                current.add_O(_word, _what);
            } // 3) add O
            else if( this.CC[c_idx] > this.CACHING_COUNTING) {
                current.moveH2O(this.C[c_idx]);
            }
            // 4) Add Hash Bucket
            else {
                // prefix check
                var h_index = 0;
                while(h_index < current.H.length) {
                    var word_idx = 0;
                    var prefix = "";
                    var h_length = current.H[h_index];
                    for(; word_idx < _word.length; word_idx++) {
                        if(_word[word_idx] != current.H[h_index + 1 + word_idx]) {
                            break;
                        } else {
                            prefix += _word[word_idx];
                        }
                    }
                    // C & O added
                    if(prefix) {
                        current.add_c(prefix, _what);
                    } else { // There is no prefix on hash bucket
                        current.H += _word.length + _word;
                        current.I.push(_what);
                    }
                    h_index += h_length + 1;
                    console.log(`h_index = ${h_index}, ${current.H.substr(0, h_index)}`);
                }
            } // Bucket to Characters
            else if (current.length == self.BUCKET_START_POINT) {
                console.log("moveH2O start");
            }
            else { //Characters
                /*
                var h_idx = 0;
                while(current.H) {
                    var c_idx = current.select_c(current.H[1]);
                    if(c_idx != -1) {
                        var bucket = current.pop_h(0);
                        

                        // add prefix root
                        self.addInternal(_obj, bucket.substr(maximum_idx + 1, bucket.length), current.I[c_idx]);
                        // remove what
                        current.I.splice(c_idx, 1);
                    } else { // new one
                        current.C += current.H[1];
                        current.O.push({});
                        current.O[current.O.length - 1][current.pop_h(0)] = new self.node(_what);
                    }
                    
                    for(var i = 1; i <= current.H[0]; i++) {
                        
                    }
                }*/
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
