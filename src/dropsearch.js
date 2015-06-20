/*
 * DropSearch
 * - 
 * @eltonjain
 */
(function () {
    "use strict";

    window.DropSearch = function (options) {
        var _self = this,
            defaults = {
                $select: null,                              // Select Element

                // New UI elements
                eleContainerClass: 'dropsearch',            // Main wrapper
                eleInputClass: 'dropsearch-input',          // Input search
                eleResultListClass: 'dropsearch-bucket',    // UL list - result bucket

                // Callbacks
                onInit: null,                               // Function on initialize
                onSearch: null                              // Function on Search
            };
        
        // Options
        var o = $.extend(defaults, options);

        // Initialize
        function init () {
            var base = this;

            if (o.$select) {
                $.each(o.$select, function () {
                    // Hide <select>
                    // Add NewDOM
                    // Bind onChange to Select
                    var $ele = $(this),
                        $newDOMEle,
                        dataArray = getDropdownArray($ele),
                        template,
                        html,
                        fuse;

                    o.placeholder = $ele.data('placeholder') || "";
                    $newDOMEle = getNewDOM();

                    // html = tmpl(o.template, dataArray);

                    html = getRenderedList(dataArray);

                    $ele.hide();
                    $newDOMEle.find('.' + o.eleResultListClass).html(html);
                    $ele.after($newDOMEle);

                    fuse = new Fuse(dataArray, {
                        keys: ['name'],
                        id: 'value',
                        location: o.location || 0,
                        threshold: o.threshold || 0.61,
                        distance: o.distance || 100,
                        maxPatternLength: o.maxPatternLength || 64,
                        caseSensitive: o.caseSensitive || false,
                        includeScore: o.includeScore || false,
                        shouldSort: o.shouldSort || true
                    });

                    attachNewEvents($ele, $newDOMEle, fuse);

                });

            } else {
                throw("Invalid Source");
            }

            if(o.onInit) {
                o.onInit();
            }
        };

        function attachNewEvents ($select, $dropsearch, fuse) {
            var $bucket = $dropsearch.children('.' + o.eleResultListClass),
                $lis = $bucket.children('li'),
                $input = $dropsearch.children('.' + o.eleInputClass),
                flag = false;

            // TODO
            // Implement THROTTLE

            $select.on('change', function () {
                // Update DropSearch elements
                var $opt = $select.find('option:selected'),
                    keyVal = getSelectOptionKeyVal($opt);

                resetDropSearchEle($dropsearch);
                console.log(keyVal);
                if(keyVal.value !== "") {
                    $input.val(keyVal.name);
                }
            });
            
            $input.on('focus', function () {
                $bucket.show();
            }).on('blur', function () {
                setTimeout(function () {
                    if(flag === false) {
                        $bucket.hide();
                    }
                }, 50);
            }).on('keyup', function () {
                var $this = $(this),
                    query = $.trim($this.val()),
                    results;
                if(query === '') {
                    // No results
                    // Show all
                    // console.log('No results found');
                    $lis.css('display', 'list-item');
                } else {
                    results = fuse.search(query);
                    $lis.css('display', 'none');
                    if(results.length > 0) {
                        $.each(results, function (i, v) {
                            $lis.filter('[data-val=' + v + ']').css('display', 'list-item');
                        });
                        $bucket.show();
                    } else {
                        $bucket.hide();
                    }
                    $select.val('');
                }

                if(o.onSearch) {
                    o.onSearch();
                }
            });

            $lis.on('click', function (e) {
                e.preventDefault();
                flag = true;
                $input.val($(this).html());
                $select.val($(this).data('val'));
                flag = false;
            });

            $select.trigger('change');
        }

        // Reset new dropsearch element
        function resetDropSearchEle ($dropsearch) {
            $dropsearch.find('.' + o.eleInputClass).val('');
            $dropsearch.find('li').css('display', 'list-item');
        }

        // New DOM Element
        function getNewDOM () {
            var $newEle = $('<div>').addClass(o.eleContainerClass),
                $newInput = $('<input type="text">').addClass(o.eleInputClass).attr('placeholder', o.placeholder),
                $newBucket = $('<ul>').addClass(o.eleResultListClass);

            $newEle.append($newInput).append($newBucket);
            return $newEle;
        }


        // get JSON data for SELECT
        function getDropdownArray ($select) {
            var data = [];

            $.each($select.find('option'), function (i) {
                var $opt = $(this),
                    keyVal = getSelectOptionKeyVal($opt);


                if(keyVal.value) {
                    data.push(keyVal);
                }
            });

            return data;
        }


        // Return <select> selected option Key val as Object
        function getSelectOptionKeyVal ($option) {
            var text = $option.html(),
                value = $option.attr('value');

            if (value === undefined) {
                value = text;
            } else if (value === "") {
                value = "";
            }

            return {name: text, value: value};
        }

        // Return LI list of <select> list data
        function getRenderedList (arr) {
            var html = "";
            for(var i = 0; i< arr.length; i++) {
                html += "<li data-val='"+arr[i].value+"'>"+arr[i].name+"</li>";
            }
            return html;
        }

        init();
    };

})();