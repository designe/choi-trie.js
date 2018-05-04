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
            VERSION : '0.2.1',
            AUTHOR : "jbear"
        };

        var T = this;

        T.CACHING_COUNTING = 3;
        T.BUCKET_START_POINT = 8;

        T.node = function(_word, _what){
            var _H = "";
            var _I = [];

            if(_what){
                if(_word.length == 0){
                    _H += '1;';
                } else {
                    _H += _word.length + _word;
                }
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
                "add_C" : function(_char) {
                    var idx = this.select_c(_char);

                    if(idx != -1){
                        this.cachingIt(idx);
                        return idx;
                    }
                    else{
                        this.C += _char;
                        this.CC.push(0);
                        return this.CC.length -1;
                    }
                },
                /* ! 10, @ 10^2, # 10^3 ... */
                "add_H" : function(_word, _what) {
                    var word_length = _word.length;

                    this.H += word_length + _word;
                    this.I[this.H.length - 1] = _what;
                },
                "add_O" : function(_word, _what) {
                    var c_idx = this.select_c(_word[0]);
                    console.log(`c_idx = ${c_idx}`);
                    var co = this.O[c_idx];
                    var maximum_idx = 0;
                    var maximum_key = null;
                    for(var key in co) {
                        console.log(key);
                        var min_length = (_word.length > key.length) ? key.length : _word.length;
                        for(var i = 0; i < min_length; i++) {
                            if(key[i] == _word[i]) {
                                if(maximum_key == null || maximum_idx < i) {
                                    maximum_idx = i;
                                    maximum_key = key;
                                }
                            } else {
                                break;
                            }
                        }
                    }

                    console.log(maximum_idx);
                    console.log(_word + " " + maximum_key);
                    
                    if(maximum_key) {
                        if(maximum_key.length - 1 == maximum_idx)
                            return maximum_key;
                        else {
                            var prefix = maximum_key.substr(0, maximum_idx+1);
                            co[maximum_key]
                            co[prefix] = new T.node();
                            
                            delete co[maximum_key];
                            
                        }
                    }else {
                        if(!co)
                            co = {};
                        co[_word] = new T.node("", _what);
                        console.log(this.O);
                        return true;
                    }
                },
                "cachingIt" : function (_idx) {
                    this.CC[_idx]++;
                },
                "moveH2O" : function(_idx) {
                    // prefix check
                    var word_idx = 0;
                    var h_index = 0;
                    var _char = this.C[_idx];
                    var _what = this.I[_idx];
                    while(h_index < this.H.length) {
                        var prefix = "";

                        var h_length = this.H[h_index];
                            
                        if(this.H[h_index + 1] != _char) {
                            h_index += h_length + 1;
                            continue;
                        } else {
                            var word = this.pop_h(word_idx);
                            this.I.splice(word_idx, 1);
                            this.add_O(word, _what);
                        }
                        
                        h_index += h_length + 1;
                            
                        console.log(`h_index = ${h_index}, ${this.H.substr(0, h_index)}`);
                    }
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
                "pushPostfix" : function(_postfix) {
                    
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
               1) Character Caching check & Word Length Check ( Caching Condition : CACHING_COUNTING > 3, Length Condition : > 9 )
               2) if word's cache counting is CACHING_COUNTING, moveH2O
               3) if word is satisfied with the caching counting, add O
               4) if word is not satisfied with that condition, add H
            */

            // 1) Character Caching check
            var c_idx = current.add_C(_word[0]);
            // 2) moveH2O
            if(current.CC[c_idx] == self.CACHING_COUNTING) {
                console.log("2) moveH2O");
                current.moveH2O(current.C[c_idx]);
            }
            // 3) add O
            if( current.CC[c_idx] >= self.CACHING_COUNTING || _word.length > 9) {
                console.log("3) add O");
                var result = current.add_O(_word, _what);

                if(result != true) {
                    console.log(`result : ${result}, current : ${JSON.stringify(current)}, _obj : ${JSON.stringify(_obj)}`);
                    var _obj = current.O[c_idx][result];
                    self.addInternal(_obj, _word.substr(result.length + 1, _word.length), _what);
                } else {
                    current.length++;
                }
            }
            // 4) Add Hash Bucket
            else {
                console.log("4) add Hash Bucket");
                current.add_H(_word, _what);
                current.length++;
            } // Bucket to Characters
            
        },
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
