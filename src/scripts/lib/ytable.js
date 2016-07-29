/**
 * 表格控件
 * @example
 *     var onetable = ytable.create({
 *         container:'body',
 *         batchable:true,
 *         url:'/apis/role/list',
 *         cols: [{
                alias: '角色',
                name: 'role',
                display: function(value) {
                    return value;
                }
            }],
            // 对表格每一行的操作
            operations: [{
                name: '删除',
                todo: function(data) {
                    alert(data);
                    console.log(data);
                }
            }]
 *     });
 * @module  ytable
 * @author xjc
 */
(function(Utils) {

    jQuery(function($) {

        var Ytable = function() {

        }

        /**
         * 默认选项
         * @type {Object}
         */
        Ytable.prototype.defaultOptions = {
            /**
             * 用户选项数据
             */
            // 组件的容器
            container: '',
            // 是否支持批量操作
            batchable: false,
            // 数据接口
            url: '',
            // url 参数
            urlParams: {},
            // 表格每一列的信息
            cols: [],
            // 对表格每一行的操作
            operations: [],
            // 筛选的表单
            filterForm: '',
            // 筛选的按钮
            filterButton: '',
            /**
             * 内置数据
             */
            // 分页信息
            page: {
                page: 1,
                size: 10,
                total: 100
            },
            // 数据筛选信息
            filter: {},
            rawData: [],
            // 用来渲染视图的数据
            renderData: {
                thData: {},
                trData: {},
                batchable: false,
            },
            // 表头部分重新定义
            headerHtml:''
        }

        /**
         * 初始化
         */
        Ytable.prototype.init = function(options) {

            var self = this;
            $.extend(true, this, self.defaultOptions, options);

            // 载入 table 信息 当返回的时候载入信息,否则不载入，在页面离开的时候保存信息
            self.loadInfo();

            // 初始化框架
            self.initFrame();

            // 初始化表格
            self.initTable(function() {
                // 初始化分页
                self.initPaginate();
            });

            // 初始化批量操作事件
            self.initBatchEvent();

            // 初始化筛选器
            self.initFilter();

            // 离开页面的时候保存状态
            $(window).on('unload', function(){
                self.saveInfo();
            });
            // 在点击操作的时候保存
            // $(self.container).on('click', '.ytable-opera', function(){
            //     self.saveInfo();
            // });
        };

        /**
         * 载入上次保存在本地的分页和筛选信息
         * @param  {[type]} first_argument [description]
         * @return {[type]}                [description]
         */
        Ytable.prototype.loadInfo = function() {
            var self = this;
            // 获取分页和筛选数据
            var ytableData = Utils.getSessionData(location.href+self.container);
            if (!ytableData) {
                return;
            }
            // 如果分页数据存在则设置
            if (!!ytableData.page) {
                self.page = ytableData.page;
            }
            // 如果筛选数据存在则设置
            if (!!ytableData.filter) {
                self.filter = ytableData.filter;
            }
            // 清空数据
            Utils.setSessionData(location.href+self.container, {});

        };

        /**
         * 保存当前的分页和筛选信息
         * @param  {[type]} isClear 是否清空当前数据
         * @return {[type]}                [description]
         */
        Ytable.prototype.saveInfo = function(isClear) {
            // 如果目的是清空则清空
            if (isClear) {
                Utils.setSessionData(location.href+self.container, {});
                return;
            }

            var self = this;

            // 封装 filter 和 page 的信息
            if(typeof self.filter === 'string'){
                self.filter = Utils.deparam(self.filter);
            }
            var info = {
                filter: self.filter,
                page: self.page
            }

            // 获取分页和筛选数据
            Utils.setSessionData(location.href+self.container, info);

        };


        /**
         * 初始化控件的框架结构
         */
        Ytable.prototype.initFrame = function() {
            var self = this;
            var htmlStr = '<div class="dataTables_wrapper form-inline no-footer">\
                                <div class="ytable-table"></div>\
                                <div class="ytable-page"></div>\
                            </div>';

            $(self.container).html(htmlStr);
        };
        /**
         * 初始化表格
         */
        Ytable.prototype.initTable = function(cb) {
            var self = this;
            // 第一次数据渲染
            self.getData(function(data) {
                self.dealData();
                self.dealOperations();
                self.render(function() {
                    self.decideOperationShow();
                    // 结束之后进行回调
                    $(self.container).trigger('updated');
                    if (!cb) {
                        return;
                    }
                    cb();
                });

            });
        };

        Ytable.prototype.updateTable = function(cb) {
            var self = this;
            // 第一次数据渲染
            self.getData(function(data) {
                self.dealData();

                self.render(function() {

                    self.decideOperationShow();
                    // 触发表格刷新事件
                    $(self.container).trigger('updated');
                    // 结束之后进行回调
                    if (!cb) {
                        return;
                    }
                    cb();
                });
            });
        };
        /**
         * 初始化筛选器
         * @return {[type]} [description]
         */
        Ytable.prototype.initFilter = function() {
            var self = this;

            // 判断是否配置了筛选器
            var $filterForm = $(self.filterForm);
            var $filterButton = $(self.filterButton);
            if ($filterForm <= 0) {
                return;
            }
            if ($filterButton <= 0) {
                return;
            }
            // 筛选器添加事件
            $filterButton.on('click', function(ev) {
                // 阻止默认事件
                ev.preventDefault();

                // 全部 trim
                $(self.filterForm).find('input[type=text]').each(function() {
                    $(this).val($.trim($(this).val()));
                });

                // 获取筛选表单中的数据
                var data = $(self.filterForm).serialize();
                // 调用数据表筛选方法
                self.doFilter(data);
            });

            setTimeout(function(){
                // 初始化过滤器
                for(var key in self.filter){
                    $('[name="'+key+'"]').val(self.filter[key]);
                    (function(theValue){
                        $('[name="'+key+'"]').on('rendered', function(){
                            if(!Utils.selectorHasValue($(this), theValue)){
                                return false;
                            }
                            $(this).val(theValue);
                            $(this).trigger('change');
                        })
                    })(self.filter[key]);
                }
            }, 0);

        };
        /**
         * 对表格数据进行筛选
         * @param {Object} conditions  筛选条件
         * @return {[type]} [description]
         */
        Ytable.prototype.doFilter = function(conditions, cb) {
            var self = this;
            self.filter = conditions;
            self.page.page = 1;
            self.updateTable(function() {
                self.updatePaginate();
                // 结束之后进行回调
                if (!cb) {
                    return;
                }
                cb();
            });
        };
        /**
         * 对表格数据进行批量操作
         * @return {[type]} [description]
         */
        Ytable.prototype.batch = function(cb) {
            var self = this;
            // 获取被选中的数据项的 index
            var selectedItems = [];
            $(self.container).find('tbody tr').each(function(index, trEle) {
                    if ($(trEle).hasClass('active')) {
                        selectedItems.push(self.rawData[index]);
                    }
                })
                // 将被选中的数据项传递给回调函数
            if (!cb) {
                return;
            }
            cb(selectedItems);
        };

        /**
         * 渲染
         */
        Ytable.prototype.render = function(cb) {
            var self = this;
            Utils.requireTmpl('widgets/ytable/table', function(tpl) {
                Utils.render({
                    context: $(self.container).find('.ytable-table'),
                    data: self.renderData,
                    tmpl: tpl,
                    overwrite: true
                });
                if (typeof cb === 'function') {
                    cb();
                }
            });
        };
        /**
         * 向接口请求数据
         */
        Ytable.prototype.getData = function(cb) {
            var self = this;
            // 合成参数
            var page = {
                page: self.page.page,
                size: self.page.size
            }

            if (typeof self.filter === 'string') {
                self.filter = Utils.deparam(self.filter);
            }
            var params = $.extend(params, self.urlParams);
            params = $.extend({}, params, page, self.filter);

            Utils.getData(self.url, params, function(response) {
                if (response.status !== 0) {
                    Utils.alert(response.message ? response.message : '请求数据失败');
                    return;
                }
                if (!cb) {
                    return;
                }
                // 获取数据
                self.rawData = response.data;
                // 获取总的数据量
                self.page.total = response.total;
                // 判断当前获取的数据是否为空，如果为空则尝试返回上一页
                if (self.rawData.length <= 0) {
                    if (self.page.page > 1) {
                        self.page.page--;
                        self.getData(cb);
                        return;
                    }
                }

                cb(response.data);
            });
        };
        /**
         * 生成表格数据
         * @param {Object} rawData 从接口获取的生数据
         */
        Ytable.prototype.dealData = function(rawData) {
            var self = this;
            var thData = [];
            var trData = [];

            // 生成表头数据
            $.each(self.cols, function(index, col) {

                var alias = self.getValue(col.alias);
                thData.push(alias);
            });

            // 生成表格体数据
            $.each(self.rawData, function(index, item) {
                // 每一行表格数据
                var trDataItem = [];
                $.each(self.cols, function(index, col) {
                    // 将对应的数据添加到表格数据中
                    var value = item[col.name];
                    // 对 value 进行转码
                    value = Utils.escape(value);
                    // 如果有display 函数，则调用
                    // 找到一个方法，在渲染结束之后添加元素，并且解决 xss 安全性问题
                    if (!!col.display) {
                        trDataItem.push(col.display(value, item));
                    } else {
                        trDataItem.push(value);
                    }
                });
                trData.push(trDataItem);
            })
            self.renderData.thData = thData;
            self.renderData.trData = trData;
        };
        /**
         * 处理操作
         * @return {[type]} [description]
         */
        Ytable.prototype.dealOperations = function() {
            var self = this;
            self.renderData.operations = '';

            // 生成元素
            $.each(self.operations, function(index, opera) {
                var color = opera.color || 'primary';
                var htmlstr = '<a href="javascript:;" class="ytable-opera ytable-opera-' + color + ' ytable-opera-' + index + '">' + opera.name + '</a>';
                $(self.container).on('click', '.ytable-opera-' + index, function() {
                        var dataindex = $(this).closest('tr').index();

                        opera.todo(self.rawData[dataindex]);
                    })
                    // 将元素添加到渲染数据中
                self.renderData.operations += htmlstr;
            })

            // 将是否进行批量操作添加到渲染数据中
            self.renderData.batchable = self.batchable;
        };
        /**
         * 决定一个行内操作是否显示
         */
        Ytable.prototype.decideOperationShow = function() {
            var self = this;
            // 遍历数据
            $.each(self.rawData, function(index, rowData) {
                // 表格行元素
                var $tr = $(self.container).find('tbody tr').eq(index);
                // 遍历 操作配置
                $.each(self.operations, function(index, operation) {
                    // 如果不含isShow 配置，则不作处理
                    if (typeof operation.isShow !== 'function') {
                        return;
                    }
                    var $opera = $tr.find('.ytable-opera').eq(index);
                    // 如果不显示，则隐藏操作
                    if (!operation.isShow(rowData)) {
                        $opera.hide();
                    }
                })
            });

            $('.ytable-opera')
        };
        /**
         * 从一个可能是函数的变量中获取值
         */
        Ytable.prototype.getValue = function(target) {
            if (typeof target === 'function') {
                return target();
            } else {
                return target;
            }
        };

        /**
         * 初始化批量操作的事件
         * @return {[type]} [description]
         */
        Ytable.prototype.initBatchEvent = function() {
            var self = this;

            var active_class = 'active';
            $(self.container).on('click', 'thead > tr > th input[type=checkbox]', function() {
                var th_checked = this.checked; //checkbox inside "TH" table header

                $(this).closest('table').find('tbody > tr').each(function() {
                    var row = this;
                    if (th_checked) $(row).addClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', true);
                    else $(row).removeClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', false);
                });
            });

            //select/deselect a row when the checkbox is checked/unchecked
            $(self.container).on('click', 'td input[type=checkbox]', function() {
                var $row = $(this).closest('tr');
                if ($row.is('.detail-row ')) return;
                if (this.checked) $row.addClass(active_class);
                else $row.removeClass(active_class);
            });
        };

        /**
         * 初始化分页，在组件初始化的时候调用
         * @return {[type]} [description]
         */
        Ytable.prototype.initPaginate = function() {
            var self = this;
            // 渲染
            Utils.requireTmpl('widgets/ytable/page', function(tpl) {
                Utils.render({
                    context: $(self.container).find('.ytable-page'),
                    data: {},
                    tmpl: tpl
                });
                self.updatePaginate();
                // 同步 size 和 size 选择框
                $container.find('.ytalbe-table_length').val(self.page.size);
            });

            // 注册分页按钮事件
            var $container = $(self.container);
            $container.on('click', '.paginate_button .go', function() {
                var page = parseInt($container.find('.go-page').val());
                var maxPage = Math.ceil( self.page.total / self.page.size );
                if(isNaN(page) || page < 1){
                    self.page.page = 1;
                }else if(page > maxPage){
                    self.page.page = maxPage
                }else{
                    self.page.page = page;
                }
                self.updateTable(function() {
                    self.updatePaginate();
                });
            });
            // 回车事件
            $container.on('keydown', '.go-page', function(e){
                console.log(e.keyCode);
                if(e.keyCode !== 13){
                    return;
                }
                var page = parseInt($container.find('.go-page').val());
                var maxPage = Math.ceil( self.page.total / self.page.size );
                if(isNaN(page) || page < 1){
                    self.page.page = 1;
                }else if(page > maxPage){
                    self.page.page = maxPage
                }else{
                    self.page.page = page;
                }
                self.updateTable(function() {
                    self.updatePaginate();
                });
            })
            $container.on('click', '.paginate_button.first', function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                self.page.page = 1;
                self.updateTable(function() {
                    self.updatePaginate();
                });


            });
            $container.on('click', '.paginate_button.last', function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                // 页码转换到最后一个页面
                self.page.page = Math.ceil(self.page.total / self.page.size);
                self.updateTable(function() {
                    self.updatePaginate();
                });
            });
            $container.on('click', '.paginate_button.previous', function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                self.page.page -= 1;
                self.updateTable(function() {
                    self.updatePaginate();
                });

            });
            $container.on('click', '.paginate_button.next', function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                self.page.page += 1;
                self.updateTable(function() {
                    self.updatePaginate();
                });
            });
            $container.on('click', '.js-paginate-btn', function(){
                self.page.page = parseInt($(this).text());
                self.updateTable(function() {
                    self.updatePaginate();
                });
            });
            $container.on('change', '.ytalbe-table_length', function() {

                var newsize = $(this).val();

                self.page.size = parseInt(newsize);
                self.page.page = 1;
                self.updateTable(function() {
                    self.updatePaginate();
                });
            })
        };

        /**
         * 更新表格数据
         */
        Ytable.prototype.update = function() {
            var self = this;
            var $container = $(self.container);
            self.updateTable(function() {
                self.updatePaginate();
            });
        }

        /**
         * 更新分页，在表格数据更新的时候更新分页
         * @return {[type]} [description]
         */
        Ytable.prototype.updatePaginate = function() {
            // 分页计算有问题
            var self = this;
            // 计算分页信息
            var page = self.page.page;
            var size = self.page.size;
            var total = self.page.total;
            var lastPage = Math.ceil(total / size);
            var firstPage = 1;

            // 条目的开始 index
            var firstItem = (page - 1) * size + 1;
            // 条目的结束 index
            var lastItem = firstItem + size - 1;
            // 修补边界条件
            if (lastItem > total) {
                lastItem = total;
            }
            if (firstItem > total) {
                firstItem = total;
            }
            if (firstItem < 0) {
                if (total === 0) {
                    firstItem = 0;
                } else {
                    firstItem = 1;
                }
            }
            if (page > lastPage) {
                page = lastPage;
            }


            var $container = $(self.container);
            // 更新分页视图
            // 清除按钮不可用的状态
            $container.find('.paginate_button').removeClass('disabled');
            // 如果页码是第一个，则禁用first 和 previous 按钮
            if (page <= firstPage) {
                $container.find('.paginate_button.first').addClass('disabled');
                $container.find('.paginate_button.previous').addClass('disabled');
            }
            // 如果页码是最后个，则禁用last 和 next 按钮
            if (page >= lastPage) {
                $container.find('.paginate_button.last').addClass('disabled');
                $container.find('.paginate_button.next').addClass('disabled');
            }

            // 更新页码数量，计算页码数量
            
            var windowSize = 5,
                    maxPage = Math.ceil( total / size ),
                    basePage = (page-1) - ( (page-1) % windowSize ),
                    startPage = basePage + 1,
                    endPage = basePage + windowSize,
                    pageArrayHtml = '';

            endPage = endPage<maxPage ? endPage : maxPage;
            for(var i = startPage; i <= endPage; i++){
                if(i === page){
                    pageArrayHtml += ('<li class="paginate_button pagination_num js-paginate-btn active"><a href="javascript:;">' + i + '</a></li>');
                }else{
                    pageArrayHtml += ('<li class="paginate_button pagination_num js-paginate-btn"><a href="javascript:;">' + i + '</a></li>');    
                }
            }

            $container.find('.pagination_num').remove();
            $container.find('.paginate_button.previous').after(pageArrayHtml);
            // 更新分页信息
            $(self.container).find('.ytable-paginate-info').html('显示第 ' + firstItem + ' 到 ' + lastItem + ' 条， 共' + total + '条数据, 共'+lastPage+'页');
            // 更新当前页码数据
            $(self.container).find('.go-page').val(self.page.page);
        };

        /**
         * 监听事件
         * @type {Object}
         */
        Ytable.prototype.on = function(eventName, handler) {
            var self = this;
            $(self.container).on(eventName, handler);
        }

        window.ytable = {
            create: function(options) {
                var ytable = new Ytable();
                ytable.init(options);
                return ytable;
            }
        }
    })

})(Utils)
