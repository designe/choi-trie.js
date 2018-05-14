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
            VERSION : '0.2.7',
            AUTHOR : "jbear"
        };

        var T = this;

        T.CACHING_COUNTING = 2;

        T.node = function(_word, _what){
            var _C = "";
            var _H = "";
            var _O = [];
            var _I = [];
            var _CC = [];
            console.log(_what);
            if(_what){
                if(_word.length == 0){
                    _C += ';';
                    _H += '1;';
                } else {
                    _C += _word[0];
                    _H += _word.length + _word;
                }
                _CC.push(1);

                if(_what.constructor === Array) {
                    _I.push(_what);
                } else {
                    _I.push([]);
                    _I[0].push(_what);
                }
                console.log(`_what = ${_what}`);
                console.log(`_what = ${JSON.stringify(_what)}`);

            }
            return {
                "C" : _C, // Caching(first characeters) are saved here. (C & O)
                "H" : _H, // Hash bucket (H & I)
                "O" : _O, // generic nOde 
                "I" : _I, // result of retrIeval
                "CC" : _CC, // Caching Counting
                "length" : _I.length,
                "length_h" : 0,
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
                        this.CC.push(1);
                        return this.C.length - 1;
                    }
                },
                /* ! 10, @ 10^2, # 10^3 ... */
                "add_H" : function(_word, _what) {
                    var h_idx = this.select_H(_word);
                    console.log(`add_H : h_idx = ${h_idx} word = ${_word}, what ${JSON.stringify(_what)}`);
                    if(h_idx == -1) {
                        var word_length = _word.length;
                        this.H += word_length + _word;
                        h_idx = this.length_h; 
                        this.length_h++;
                    }

                    if(!this.I[h_idx]){
                        this.I[h_idx] = [];
                    }

                    console.log(`add_H : h_idx = ${h_idx}, this.H = ${JSON.stringify(this.H)},  this.I = ${JSON.stringify(this.I)}`);
                    this.I[h_idx].push(_what);
                },
                "add_O" : function(_word, _what) {
                    var c_idx = this.select_c(_word[0]);
                    console.log(`add_O : c_idx = ${c_idx}, this.O = ${JSON.stringify(this.O)}`);
                    if(!this.O[c_idx])
                        this.O[c_idx] = {};
                    
                    var co = this.O[c_idx];
                    var maximum_idx = 0;
                    var maximum_key = null;
                    for(var key in co) {
                        var min_length = (_word.length > key.length) ? key.length : _word.length;
                        for(var i = 0; i < min_length; i++) {
                            console.log(`add_O : _word = ${_word} key = ${key}`);
                            if(key[i] == _word[i]) {
                                if(maximum_key == null || maximum_idx <= i) {
                                    maximum_idx = i;
                                    maximum_key = key;
                                }
                            } else {
                                break;
                            }
                        }
                    }

                    console.log(`add_O : _word = ${_word}, _what = ${JSON.stringify(_what)} maximum_idx = ${maximum_idx} maximum_key = ${maximum_key}`);
                    
                    if(maximum_key) {
                        if(maximum_key.length - 1 == maximum_idx)
                            return maximum_key;
                        else {
                            var prefix = maximum_key.substr(0, maximum_idx+1);
                            var postfix = maximum_key.substr(maximum_idx + 1, maximum_key.length - maximum_idx);

                            console.log(`add_O : prefix = ${prefix}, postfix = ${postfix}`);
                            
                            co[maximum_key].moveAllH2O();
                            
                            co[maximum_key].pushPostfix(postfix);
                            co[prefix] = co[maximum_key];
                            delete co[maximum_key];

                            console.log(`add_O : co[prefix] = ${JSON.stringify(co[prefix])}`);

                            return prefix;
                        }
                    } else {
                        console.log(`add_O : PUSHED what = ${_what}`);
                        co[_word] = new T.node("", _what);
                        console.log(`add_O : co[_word] = ${JSON.stringify(co[_word])}`);
                        return true;
                    }
                },
                "cachingIt" : function (_idx) {
                    this.CC[_idx]++;
                },
                "moveH2O" : function(_idx) {
                    var word_idx = 0;
                    var h_index = 0;
                    
                    var _char = this.C[_idx];
                    var _what = this.I[_idx];

                    var idx_counting = 0;
                    for(var i = 0; i < this.CC.length; i++) {
                        if(this.CC[i] > T.CACHING_COUNTING) {
                            continue;
                        } else {
                            _what = this.I[idx_counting++];
                            if(idx_counting == _idx) {
                                _char = this.C[i];
                            }
                        }
                    }

                    console.log(`moveH2O : this = ${JSON.stringify(this)} this.CC = ${JSON.stringify(this.CC)}`);
                    console.log(`moveH2O : _idx = ${_idx}, _char = ${_char}, _what = ${JSON.stringify(_what)} this.H = ${this.H}, this.O = ${JSON.stringify(this.O)}`);
                    while(h_index < this.H.length) {
                        var prefix = "";

                        var h_length = Number.parseInt(this.H[h_index]);
                            
                        if(this.H[h_index + 1] != _char) {
                            h_index += h_length + 1;
                            console.log(`moveH2O : h_index = ${h_index}, ${this.H.substr(0, h_index)} in while`);
                            word_idx++;
                            continue;
                        } else {
                            var word = this.pop_h(word_idx);
                            console.log(`moveH2O : word = ${word} in while`);
                            this.I.splice(word_idx, 1);
                            this.add_O(word, _what);
                            this.length_h--;
                            break;
                        }
                    }

                    console.log(`moveH2O : _idx = ${_idx} this.H = ${this.H}, this.O = ${JSON.stringify(this.O)}`);
                    
                    /* Caching Counting should be changed for H to O */
                    if(this.CC[_idx] <= T.CACHING_COUNTING)
                        this.CC[_idx] += T.CACHING_COUNTING;
                },
                "moveAllH2O" : function() {
                    var h_index = 0;
                    // move bucket to object.
                    console.log(`moveAllH2O : this.H = ${JSON.stringify(this.H)}`);
                    console.log(`moveAllH2O : this.O = ${JSON.stringify(this.O)}`);
                    console.log(`moveAllH2O : this.I = ${JSON.stringify(this.I)}`);
                    while(h_index < this.H.length) {                        
                        if(this.H[h_index + 1]){
                            var word = this.pop_h(0);
                            var what = this.I[0];
                            this.I.splice(0, 1);
                            this.add_O(word, what);
                        }
                    }
                    console.log(`moveAllH2O : this.H = ${JSON.stringify(this.H)}`);
                    console.log(`moveAllH2O : this.O = ${JSON.stringify(this.O)}`);
                    console.log(`moveAllH2O : this.I = ${JSON.stringify(this.I)}`);
                    //Caching Counting Up Hardly
                    console.log(`moveAllH2O : this.CC = ${JSON.stringify(this.CC)} T.CACHING_COUNTING = ${T.CACHING_COUNTING}`);
                    for(var i = 0 ; i < this.CC.length; i++) {
                        if(this.CC[i] < T.CACHING_COUNTING)
                            this.CC[i] += T.CACHING_COUNTING;
                    }
                },
                "select_H" : function(_word) {
                    var idx = 0;
                    var bucket_idx = 0;
                    var bucket = this.H;
                    while(bucket_idx < bucket.length) {
                        if(_word.length == bucket[bucket_idx]) {
                            var isFound = true;
                            var bucket_i = bucket_idx + 1;
                            for(var i = 0; i < _word.length; i++, bucket_i++) {
                                if(_word[i] != bucket[bucket_i]) {
                                    isFound = false;
                                    break;
                                }
                            }

                            if(isFound)
                                return idx;
                            else {
                                bucket_idx += _word.length + 1;
                                console.log(`select_H : bucket = ${bucket}, bucket_idx = ${bucket_idx}`);
                                idx++;
                            }
                        }
                        else{
                            bucket_idx += Number.parseInt(bucket[bucket_idx]) + 1;
                            console.log(`select_H : bucket = ${bucket}, bucket_idx = ${bucket_idx}`);
                            idx++;
                        }
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
                    // C O
                    // Caching
                    this.C = _postfix[0];

                    // Cache Counting Check
                    var CC_SUM = 0;
                    console.log(`pushPostfix : this.CC = ${JSON.stringify(this.CC)}`);
                    for(var i = 0; i < this.CC.length; i++)
                        CC_SUM += this.CC[i];

                    this.CC.length = 0; // INIT CC
                    this.CC.push(CC_SUM);
                    console.log(`pushPostfix : this.CC = ${JSON.stringify(this.CC)}`);
                    
                    
                    // Object Check
                    var postfixObject = {};
                    console.log(`pushPostfix : this.O = ${JSON.stringify(this.O)}`);
                    for(var i = 0; i < this.O.length; i++) {
                        for(var key in this.O[i]) {
                            console.log(`pushPostfix : key = ${key}`);
                            if(key && key.length == 1 && key[0] == ';')
                                this.O[i][_postfix] = this.O[i][key];
                            else {
                                this.O[i][_postfix + key] = this.O[i][key];
                            }
                            delete this.O[i][key];
                        }
                    }
                    console.log(`pushPostfix : this.O = ${JSON.stringify(this.O)}`);
                    
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
            if(Object.keys(_root).length === 0 && _root.constructor === Object) {
                T.root = Object.assign(_root, new T.node());
            } else {
                T.root = _root;
            }
            
            console.log(`setRoot : T.root = ${JSON.stringify(T.root)}`);
            console.log(T.root);
        },
        makeRoot: function() {
            var T = this;
            var node = new T.node();
            T.root = node;
            return T.root;
        },
        add: function(_word, _what) {
            var self = this;
            // For split word by ' '
            var splittedWord = _word.split(/ /g);
            self.addInternal(self.root, _word, _what);
            splittedWord.some((__word) => {
                self.addInternal(self.root, __word, _what);
            });
        },
        addInternal: function(_root, _word, _what) {
            /* 
               addInternal Process
               1) Character Caching check & Word Length Check ( Caching Condition : CACHING_COUNTING > 3, Length Condition : > 9 )
               2) if word's cache counting is same with CACHING_COUNTING, moveH2O
               3) if word is satisfied with the caching counting, add O
               4) if word is not satisfied with that condition, add H
            */
            console.log(`addInternal : function start : _word = ${_word}`);
            var self = this;
            var current = _root;

            // 1) Character Caching check
            var c_idx = -1;
            if(!_word) {
                _word = ";";
                c_idx = current.select_c(';');
                if(c_idx == -1)
                    current.C += _word;
            } else {
                c_idx = current.add_C(_word[0]);
            }
            // 2) moveH2O
            if(current.CC[c_idx] == self.CACHING_COUNTING) {
                console.log("2) moveH2O");
                current.moveH2O(c_idx);
            }
            // 3) add O
            if( current.CC[c_idx] >= self.CACHING_COUNTING || _word.length > 9) {
                // Cache Counting Up Hardly
                if(current.CC[c_idx] < self.CACHING_COUNTING)
                    current.CC[c_idx] = self.CACHING_COUNTING + 1;
                
                console.log(`3) add O word = ${_word}, _what = ${JSON.stringify(_what)}`);
                var result = current.add_O(_word, _what);

                if(result != true) {
                    var _obj = current.O[c_idx][result];
                    console.log(`result : ${result}, current : ${JSON.stringify(current)}, _obj : ${JSON.stringify(_obj)}`);
                    
                    return self.addInternal(_obj, _word.substr(result.length, _word.length), _what);
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

            console.log("----------------ROOT--------------");
            console.log(self.root);
        },
        search: function(_query) {
            /*
              Search Process for CHOI-TRIE
              1) find C
              2) Check CC
              3) if word's cache counting is more than CACHING_COUNTING, find O.
              4) if word's cache counting is less than CACHING_COUNTING, find H.              
             */

            var self = this;
            var current = self.root;
            var queryResult = [];
            var query_idx = 0;
            var prefix = null;
            var found_check = false;
            var query_instance = _query;
            var query_instance_length = query_instance.length;

            /*
              Exact Prefix Matching implementation
            */
            var max_co = null;
            var max_co_length = 0;
            var c_idx = null;
            var current_depth = 0;
            current.select_c(query_instance[0]);

            // 1) C check
            while((c_idx = current.select_c(query_instance[0])) != -1){
                console.log(`search : query_instance : ${query_instance}`);
                console.log(current);
                max_co = null;
                max_co_length = 0;
                
                // 2) CC Check
                // 3) Find O
                if(current.CC[c_idx] >= self.CACHING_COUNTING)
                {
                    var co = current.O[c_idx];
                    var co_idx = 0;

                    console.log(co);
                    max_co_length = 1;
                    for(var key in co) {
                        var min_length = (key.length > query_instance.length) ? query_instance.length : key.length;
                        if(min_length == 1) {
                            max_co = co[key];
                            break;
                        }
                        
                        var comp_idx = 1;
                        var key_idx = 0;

                        console.log(`search : co = ${JSON.stringify(co)}, min_length = ${min_length}`);
                        for(; comp_idx < min_length; comp_idx++) {
                            if(query_instance[comp_idx] == key[comp_idx]) {
                                if(max_co_length < (comp_idx+1)) {
                                    max_co = co[key];
                                    max_co_length = comp_idx+1;
                                }
                                console.log(`search : max_co = ${JSON.stringify(max_co)}, comp_idx = ${comp_idx}`);
                            } else {
                                break;
                            }
                        }
                    }

                    console.log(`max_co_length = ${max_co_length}, comp_idx = ${comp_idx}`);

                    // Totally same
                    if(max_co) {
                        current = max_co;
                        current_depth++;
                        
                        if(max_co_length == min_length) {
                            query_instance = query_instance.substr(min_length, query_instance.length);
                            if(query_instance.length == 0) {
                                query_instance = ";";
                            }
                            query_idx = 0;
                            console.log(`search : max_co_length == comp_idx`);
                            console.log(current);
                        }
                    } else break;
                }
                // 4) Find H
                else {
                    var h_idx = current.select_H(query_instance);
                    if(h_idx >= 0) {
                        for(var i = 0; i < current.I[h_idx].length; i++) {
                            queryResult.push(current.I[h_idx][i]);
                        }
                    } else {
                        console.log("There is no result.");
                    }
                    break;
                }
            }
            
            console.log("full search start!");
            console.log(current);

            // if query has already found, finish.
            if(queryResult.length > 0 || current_depth == 0)
                return queryResult;
            
            // Now Full Search!
            var fullQueue = [];
            var fullQueueIdx = 0;
            fullQueue.push(current);
            while(fullQueue.length != fullQueueIdx) {
                current = fullQueue[fullQueueIdx];
                if(!current)
                    break;
                // H pushed
                if(current.I){
                    current.I.some(function(_data) {
                        queryResult.push(_data);
                    });
                }

                // O Pushed
                if(current.C){
                    for (var c_idx = 0; c_idx < current.C.length; c_idx++) {
                        if(current.CC[c_idx] >= self.CACHING_COUNTING) {
                            for(var _key in current.O[c_idx])
                                fullQueue.push(current.O[c_idx][_key]);
                        }
                    }
                }
                fullQueueIdx++;
            }
            
            console.log("RESULT");
            console.log(_query);
            console.log(queryResult);

            return queryResult;
        } // end of search function
    };

    return ChoiTrie;
}());
