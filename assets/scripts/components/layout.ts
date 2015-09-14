/// <reference path="./../types.d.ts" />
/// <reference path="./../packadic.d.ts" />
module packadic.layout {

    import Component = packadic.components.Component;
    import Components = packadic.components.Components;
    import JQueryPositionOptions = JQueryUI.JQueryPositionOptions;

    var defaultConfig:any = {
        selectors: {
            'search': '.sidebar-search',
            'header': '.page-header',
            'header-inner': '<%= layout.selectors.header %> .page-header-inner',

            'container': '.page-container',
            'sidebar-wrapper': '.page-sidebar-wrapper',
            'sidebar': '.page-sidebar',
            'sidebar-menu': '.page-sidebar-menu',
            'content-wrapper': '.page-content-wrapper',
            'content': '.page-content',

            'content-head': '<%= layout.selectors.content %> .page-head',
            'content-breadcrumbs': '<%= layout.selectors.content %> .page-breadcrumbs',
            'content-inner': '<%= layout.selectors.content %> .page-content-inner',

            'footer': '.page-footer',
            'footer-inner': '.page-footer-inner',
        },
        breakpoints: {
            'screen-lg-med': "1260px",
            'screen-lg-min': "1200px",
            'screen-md-max': "1199px",
            'screen-md-min': "992px",
            'screen-sm-max': "991px",
            'screen-sm-min': "768px",
            'screen-xs-max': "767px",
            'screen-xs-min': "480px"
        },
        sidebar: {
            autoScroll: true,
            keepExpanded: true,
            slideSpeed: 200,
            togglerSelector: '.sidebar-toggler',
            openCloseDuration: 600,
            openedWidth: 235,
            closedWidth: 54,
            resolveActive: true
        },
        preferences: {
            sidebar: {
                hidden: false,
                closed: false,
                reversed: false,
                fixed: true,
                compact: false,
            },
            header: {
                fixed: true
            },
            footer: {
                fixed: true
            },
            page: {
                boxed: false
            }
        },
    };

    var $window:JQuery = $(<any> window),
        $document:JQuery = $(<any> document),
        $body:JQuery = $('body');

    class Elements {

        protected l:LayoutComponent;

        constructor(layout:LayoutComponent) {
            this.l = layout;
        }

        public get header() {
            return this.l.el('header');
        }

        public get headerInner() {
            return this.l.el('header-inner');
        }

        public get container() {
            return this.l.el('container');
        }

        public get content() {
            return this.l.el('content');
        }

        public get sidebar() {
            return this.l.el('sidebar');
        }

        public get sidebarMenu() {
            return this.l.el('sidebar-menu');
        }

        public get footer() {
            return this.l.el('footer');
        }

        public get footerInner() {
            return this.l.el('footer-inner');
        }



    }

    var el:Elements;


    /**
     * @class LayoutComponent
     */
    export class LayoutComponent extends Component {

        public openCloseInProgress:boolean = false;
        public closing:boolean = false;

        public init() {
            this.app.debug.log('LayoutComponent init');
            this.app.on('booted', () => {
                debug.log('layout received event emitted from app: booted');
                this.removePageLoader();
            })
        }

        public boot() {
            debug.log('LayoutComponent debug');
            el = new Elements(this);
            this._initHeader();
            this._initFixed();
            this._initSidebarSubmenus();
            this._initToggleButton();
            this._initGoTop();
            //self._initPreferences();


            // self._initLogo();
            this.sidebarResolveActive();

            this.fixBreadcrumb();
            this._initResizeEvent();
            this._initSidebarResizeListener();

            var self:LayoutComponent = this;
            $('body').onClick( '[data-layout-api]', function(e){
                var action:string = $(this).attr('data-layout-api');
                switch(action){
                    case 'toggle-sidebar': self.isSidebarClosed() ? self.openSidebar() : self.closeSidebar(); break;
                    case 'page-boxed': self.setBoxed(!self.isBoxed() ); break;
                    case 'header-fixed': self.setHeaderFixed(!self.isHeaderFixed() ); break;
                    case 'footer-fixed': self.setFooterFixed(!self.isFooterFixed() ); break;
                    case 'sidebar-fixed': self.setSidebarFixed(!self.isSidebarFixed()); break;
                    case 'close-submenus': self.closeSubmenus(); break;
                    case 'close-sidebar': self.closeSidebar(); break;
                    case 'open-sidebar': self.openSidebar(); break;
                    case 'hide-sidebar': self.hideSidebar(); break;
                    case 'show-sidebar': self.showSidebar(); break;
                    case 'compact-sidebar': self.setSidebarCompact(!self.isSidebarCompact()); break;
                    case 'hover-sidebar': self.setSidebarHover(!self.isSidebarHover()); break;
                    case 'reversed-sidebar': self.setSidebarReversed(!self.isSidebarReversed()); break;
                }
            })
        }


        public removePageLoader() {
            $body.removeClass('page-loading');
        }

        public createLoader(name, el):Loader {
            return new Loader(name, el);
        }

        public el(selectorName:string):JQuery {
            var selector:string = this.config.get('layout.selectors.' + selectorName);
            return $(selector);
        }


        /****************************/
        // Initialisation
        /****************************/

        protected _initResizeEvent() {
            var resize:number;
            $(window).resize(() => {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(() => {
                    this.app.emit('resize');
                }, 50);
            });
        }

        protected _initSidebarResizeListener() {
            var resizing:boolean = false;
            this.app.on('resize', () => {
                if (resizing) {
                    return;
                }
                resizing = true;
                setTimeout(() => {
                    this._initFixed();
                    resizing = false;
                }, this.config('layout.sidebar.slideSpeed'));
            });
        }

        protected _initHeader() {
            var self:LayoutComponent = this;
        }

        public fixBreadcrumb() {
            var $i:JQuery = $('.page-breadcrumb').find('> li').last().find('i');
            if ($i.size() > 0) {
                $i.remove();
            }
        }

        protected _initGoTop() {
            var self:LayoutComponent = this;
            var offset = 300;
            var duration = 500;

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) { // ios supported
                $window.bind("touchend touchcancel touchleave", function (e) {
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            } else { // general
                $window.scroll(function () {
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            }

            $('.scroll-to-top').click(function (e) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: 0
                }, duration);
                return false;
            });

        }

        protected _initFixed() {

            plugins.destroySlimScroll(el.sidebarMenu);

            if (!this.isSidebarFixed()) {
                return;
            }
            if (getViewPort().width >= this.getBreakpoint('md')) {
                el.sidebarMenu.attr("data-height", this.calculateViewportHeight());
                plugins.makeSlimScroll(el.sidebarMenu, {
                    position: this.isSidebarReversed() ? 'left' : 'right', // position of the scroll bar
                    allowPageScroll: false
                });
                //el.content.css('min-height', this.calculateViewportHeight() + 'px');
            }
        }

        protected _initSidebarSubmenus() {
            var self:LayoutComponent = this;
            el.sidebar.onClick( 'li > a', function (e) {
                var $this = $(this);
                if (getViewPort().width >= self.getBreakpoint('md') && $this.parents('.page-sidebar-menu-hover-submenu').size() === 1) { // exit of hover sidebar menu
                    return;
                }

                if ($this.next().hasClass('sub-menu') === false) {
                    if (getViewPort().width < self.getBreakpoint('md') && el.sidebarMenu.hasClass("in")) { // close the menu on mobile view while laoding a page
                        $('.page-header .responsive-toggler').click();
                    }
                    return;
                }

                if ($this.next().hasClass('sub-menu always-open')) {
                    return;
                }

                var $parent = $this.parent().parent();

                var $subMenu = $this.next();

                if (self.config('layout.sidebar.keepExpand') !== true) {
                    $parent.children('li.open').children('a').children('.arrow').removeClass('open');
                    $parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(self.config('layout.sidebar.slideSpeed'));
                    $parent.children('li.open').removeClass('open');
                }


                var slideOffeset = -200;
                var visible:boolean = $subMenu.is(":visible");
                $this.find('.arrow').ensureClass("open", !visible);
                $this.parent().ensureClass("open", !visible);
                debug.log('sidebarsubmenu', visible, $this, $subMenu);
                $subMenu[visible ? 'slideUp' : 'slideDown'](self.config('layout.sidebar.slideSpeed'), function () {
                    if (self.config('layout.sidebar.autoScroll') === true && self.isSidebarClosed() === false) {
                        if (self.isSidebarFixed()) {
                            el.sidebarMenu.slimScroll({scrollTo: $this.position().top});
                        } else {
                            self.scrollTo($this, slideOffeset);
                        }
                    }
                });
                e.preventDefault();
            });
            $document.onClick( '.page-header-fixed-mobile .responsive-toggler', function () {
                self.scrollTop();
            });
        }

        protected _initToggleButton() {
            return;
            var self:LayoutComponent = this;
            $body.onClick( self.config('layout.sidebar.togglerSelector'), function (e) {
                if (self.isSidebarClosed()) {
                    self.openSidebar();
                } else {
                    self.closeSidebar();
                }
            });

            self._initFixedHovered();
        }

        protected _initFixedHovered() {
            var self:LayoutComponent = this;
            if (self.isSidebarFixed()) {
                el.sidebarMenu.on('mouseenter', function () {
                    if (self.isSidebarClosed()) {
                        el.sidebar.removeClass('page-sidebar-menu-closed');
                    }
                }).on('mouseleave', function () {
                    if (self.isSidebarClosed()) {
                        el.sidebar.addClass('page-sidebar-menu-closed');
                    }
                });
            }
        }


        /****************************/
        // Sidebar interaction
        /****************************/

        protected setSidebarClosed(closed:boolean = true) {
            $body.ensureClass("page-sidebar-closed", closed);
            el.sidebarMenu.ensureClass("page-sidebar-menu-closed", closed);
            if (this.isSidebarClosed() && this.isSidebarFixed()) {
                el.sidebarMenu.trigger("mouseleave");
            }
        }

        public closeSubmenus() {

            el.sidebarMenu.children('li.open').children('a').children('.arrow').removeClass('open');
            el.sidebarMenu.children('li.open').children('.sub-menu:not(.always-open)').slideUp(this.config('layout.sidebar.slideSpeed'));
            el.sidebarMenu.children('li.open').removeClass('open');
            /*
            el.sidebarMenu.find('ul.sub-menu').each(() => {
                var $ul:JQuery = $(this);
                if ($ul.is(":visible")) {
                    $('.arrow', $ul).removeClass("open");
                    $ul.parent().removeClass("open");
                    $ul.slideUp(this.config('layout.sidebar.slideSpeed'));
                }
            });*/
            this.app.emit('sidebar:close-submenus');
        }

        public closeSidebar(callback?:any):JQueryPromise<any> {
            var self:LayoutComponent = this;
            var $main = $('main');

            if (self.openCloseInProgress || self.isSidebarClosed()) {
                return;
            }
            self.openCloseInProgress = true;
            self.closing = true;
            var defer:any = $.Deferred();

            this.app.emit('sidebar:close');
            self.closeSubmenus();

            var $title = el.sidebarMenu.find('li a span.title, li a span.arrow');


            async.parallel([
                function (cb:any) {
                    el.content.animate({
                        'margin-left': self.config('layout.sidebar.closedWidth')
                    }, self.config('layout.sidebar.openCloseDuration'), function () {
                        cb();
                    })
                },
                function (cb:any) {
                    el.sidebar.animate({
                        width: self.config('layout.sidebar.closedWidth')
                    }, self.config('layout.sidebar.openCloseDuration'), function () {
                        cb();
                    })
                },
                function (cb:any) {
                    var closed = 0;
                    $title.animate({
                        opacity: 0
                    }, self.config('layout.sidebar.openCloseDuration') / 3, function () {
                        closed++;
                        if (closed == $title.length) {
                            $title.css('display', 'none');
                            cb();
                        }
                    })
                }
            ], function (err, results) {

                self.setSidebarClosed(true);
                el.sidebar.removeAttr('style');
                el.content.removeAttr('style');
                $title.removeAttr('style');

                self.closing = false;
                self.openCloseInProgress = false;

                if (_.isFunction(callback)) {
                    callback();
                }
                defer.resolve();
                self.app.emit('sidebar:closed');
            });
            return defer.promise();
        }

        public openSidebar(callback?:any):JQueryPromise<any> {
            var self:LayoutComponent = this;
            if (self.openCloseInProgress || !self.isSidebarClosed()) {
                return;
            }

            self.openCloseInProgress = true;
            var defer:any = $.Deferred();
            var $title:JQuery = el.sidebarMenu.find('li a span.title, li a span.arrow');

            self.setSidebarClosed(false);

            this.app.emit('sidebar:open');
            async.parallel([
                function (cb:any) {
                    el.content.css('margin-left', self.config('layout.sidebar.closedWidth'))
                        .animate({
                        'margin-left': self.config('layout.sidebar.openedWidth')
                    }, self.config('layout.sidebar.openCloseDuration'), function () {
                        cb();
                    })
                },
                function (cb:any) {
                    el.sidebar.css('width', self.config('layout.sidebar.closedWidth'))
                        .animate({
                        width: self.config('layout.sidebar.openedWidth')
                    }, self.config('layout.sidebar.openCloseDuration'), function () {
                        cb();
                    })
                },
                function (cb:any) {
                    var opened = 0;

                    $title.css({
                        opacity: 0,
                        display: 'none'
                    });
                    setTimeout(function () {
                        $title.css('display', 'initial');
                        $title.animate({
                            opacity: 1
                        }, self.config('layout.sidebar.openCloseDuration ') / 2, function () {
                            opened++;
                            if (opened == $title.length) {
                                $title.css('display', 'none');
                                cb();
                            }
                        })
                    }, self.config('layout.sidebar.openCloseDuration') / 2)
                }
            ], function (err, results) {
                el.content.removeAttr('style');
                el.sidebar.removeAttr('style');
                $title.removeAttr('style');

                self.openCloseInProgress = false;

                if (_.isFunction(callback)) {
                    callback();
                }
                defer.resolve();

                self.app.emit('sidebar:opened');
            });
            return defer.promise();
        }

        public hideSidebar() {
            if (this.config('layout.preferences.sidebar.hidden')) {
                return;
            }

            if (!$body.hasClass('page-sidebar-closed')) {
                $body.addClass('page-sidebar-closed');
            }
            if (!$body.hasClass('page-sidebar-hide')) {
                $body.addClass('page-sidebar-hide');
            }
            $('header.top .sidebar-toggler').hide();
            this.app.emit('sidebar:hide');
        }

        public showSidebar() {
            //this.options.hidden = false;
            $body.removeClass('page-sidebar-closed')
                .removeClass('page-sidebar-hide');
            $('header.top .sidebar-toggler').show();
            this.app.emit('sidebar:show');
        }

        protected sidebarResolveActive() {
            var self:LayoutComponent = this;
            if (this.config('layout.sidebar.resolveActive') !== true) return;
            var currentPath = util.str.trim(location.pathname.toLowerCase(), '/');
            var md = this.getBreakpoint('md');
            if (getViewPort().width < md) {
                return; // not gonna do this for small devices
            }
            el.sidebarMenu.find('a').each(function () {
                var href:string = $(this).attr('href');
                if (!_.isString(href)) {
                    return;
                }

                href = util.str.trim(href)
                    .replace(location['origin'], '')
                    .replace(/\.\.\//g, '');

                if (location['hostname'] !== 'localhost') {
                    href = self.config('docgen.baseUrl') + href;
                }

                var path = util.str.trim(href, '/');
                debug.log(path, currentPath, href);

                if (path == currentPath) { //util.strEndsWith(path, currentPath)
                    debug.log('Resolved active sidebar link', this);
                    var $el = $(this);
                    $el.parent('li').not('.active').addClass('active');
                    var $parentsLi = $el.parents('li').addClass('open');
                    $parentsLi.find('.arrow').addClass('open');
                    $parentsLi.has('ul').children('ul').show();
                }
            })

        }


        public setSidebarFixed(fixed:boolean) {
            $body.ensureClass("page-sidebar-fixed", fixed);
            if (!fixed) {
                el.sidebarMenu.unbind('mouseenter').unbind('mouseleave');
            } else {
                this._initFixedHovered();
            }
            this._initFixed();
            this.app.emit('sidebar:' + fixed ? 'fix' : 'unfix');
        }

        public setSidebarCompact(compact:boolean) {
            el.sidebarMenu.ensureClass("page-sidebar-menu-compact", compact);
            this.app.emit('sidebar:' + compact ? 'compact' : 'decompact');
        }

        public setSidebarHover(hover:boolean) {
            el.sidebarMenu.ensureClass("page-sidebar-menu-hover-submenu", hover && !this.isSidebarFixed());
            this.app.emit('sidebar:' + hover ? 'hover' : 'dehover');
        }

        public setSidebarReversed(reversed:boolean) {
            $body.ensureClass("page-sidebar-reversed", reversed);
            this.app.emit('sidebar:' + reversed ? 'set-right' : 'set-left');
        }

        /****************************/
        // Layout interaction
        /****************************/
        public setHeaderFixed(fixed:boolean) {
            if (fixed === true) {
                $body.addClass("page-header-fixed");
                el.header.removeClass("navbar-static-top").addClass("navbar-fixed-top");
            } else {
                $body.removeClass("page-header-fixed");
                el.header.removeClass("navbar-fixed-top").addClass("navbar-static-top");
            }
            this.app.emit('header:set-fixed', fixed);
        }

        public setFooterFixed(fixed:boolean) {
            if (fixed === true) {
                $body.addClass("page-footer-fixed");
            } else {
                $body.removeClass("page-footer-fixed");
            }
            this.app.emit('footer:set-fixed', fixed);
        }

        public setBoxed(boxed:boolean) {
            $body.ensureClass('page-boxed', boxed);
            el.headerInner.ensureClass("container", boxed);

            if (boxed === true) {

                var cont = $('body > .clearfix').after('<div class="container"></div>');

                // el.container = .page-container
                el.container.appendTo('body > .clearfix + .container');
                if (this.isFooterFixed()) {
                    el.footerInner.wrap($('<div>').addClass('container'));
                    //el.footer.html('<div class="container">' + el.footer.html() + '</div>');
                } else {
                    el.footer.appendTo('body > .clearfix + .container');
                }
            } else {
                var cont = $('body > .clearfix + .container').children().unwrap();
                if (this.isFooterFixed()) {
                    el.footer.find('> .container').unwrap();
                }
                //cont.remove();
            }
            this.app.emit('resize');
            this.app.emit('set-boxed', boxed);
        }

        public reset() {
            $body.
                removeClass("page-boxed").
                removeClass("page-footer-fixed").
                removeClass("page-sidebar-fixed").
                removeClass("page-header-fixed").
                removeClass("page-sidebar-reversed");

            el.header.removeClass('navbar-fixed-top');
            el.headerInner.removeClass("container");

            if (el.container.parent(".container").size() === 1) {
                el.container.insertAfter('body > .clearfix');
            }

            if ($('.page-footer > .container').size() === 1) {
                el.footer.html($('.page-footer > .container').html());
            } else if (el.footer.parent(".container").size() === 1) {
                el.footer.insertAfter(el.container);
                $('.scroll-to-top').insertAfter(el.footer);
            }

            $('body > .container').remove();

        }

        public scrollTo(ele?:any, offset?:number) {
            var $el:JQuery = typeof(ele) === 'string' ? $(ele) : ele;
            var pos = ($el && $el.size() > 0) ? $el.offset().top : 0;

            if ($el) {

                if ($body.hasClass('page-header-fixed')) {
                    pos = pos - el.header.height();
                }
                pos = pos + (offset ? offset : -1 * $el.height());
            }

            $('html,body').animate({
                scrollTop: pos
            }, 'slow');
        }

        public scrollTop() {
            this.scrollTo();
        }


        /****************************/
        // Helpers
        /****************************/

        public getBreakpoint(which:string) {
            return parseInt(this.config.get('layout.breakpoints.screen-' + which + '-min').replace('px', ''));
        }

        public calculateViewportHeight() {
            var sidebarHeight = getViewPort().height - el.header.outerHeight() - 30;
            if (this.isFooterFixed()) {
                sidebarHeight = sidebarHeight - el.footer.outerHeight();
            }

            return sidebarHeight;
        }

        public isHeaderFixed():boolean {
            return $body.hasClass('page-header-fixed');
        }

        public isFooterFixed():boolean {
            return $body.hasClass('page-footer-fixed');
        }

        public isBoxed():boolean {
            return $body.hasClass('page-boxed');
        }

        public isSidebarClosed():boolean {
            return $body.hasClass('page-sidebar-closed')
        }

        public isSidebarHidden():boolean {
            return $body.hasClass('page-sidebar-hide');
        }

        public isSidebarFixed():boolean {
            return $('.page-sidebar-fixed').size() !== 0;
        }

        public isSidebarCompact():boolean {
            return el.sidebarMenu.hasClass('page-sidebar-menu-compact');
        }

        public isSidebarHover():boolean {
            return el.sidebarMenu.hasClass('page-sidebar-menu-hover-submenu');
        }

        public isSidebarReversed():boolean {
            return $body.hasClass('page-sidebar-reversed');
        }


    }


    export class Loader {
        private name:string;
        private $el:JQuery;
        private $loader:JQuery;
        private $parent:JQuery;
        private started:boolean;

        constructor(name:string, el:any) {
            this.name = name;
            this.$el = typeof(el) === 'string' ? $(el) : el;
        }

        public stop() {
            if (!this.started) {
                return;
            }
            this.$el.removeClass(this.name + '-loader-content');
            this.$parent.removeClass(this.name + '-loading');
            this.$loader.remove();
            this.started = false;
        }

        public start() {
            if (this.started) {
                return;
            }
            this.$el.addClass(this.name + '-loader-content');
            this.$parent = this.$el.parent().addClass(this.name + '-loading');
            var $loaderInner = $('<div>').addClass('loader loader-' + this.name);
            this.$loader = $('<div>').addClass(this.name + '-loader');
            this.$loader.append($loaderInner).prependTo(this.$parent);
        }
    }


    Components.register('layout', LayoutComponent, defaultConfig);
}
