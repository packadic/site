/// <reference path="./../types.d.ts" />
/// <reference path="./../packadic.d.ts" />
module packadic.layout {

    import Component = packadic.components.Component;
    import Components = packadic.components.Components;
    import JQueryPositionOptions = JQueryUI.JQueryPositionOptions;

    var defaultConfig:any = {
        transitionTime: 500
    };

    var $body:JQuery = $('body');

    /**
     * @class LayoutComponent
     */
    export class QuickSidebarComponent extends Component {

        switching:boolean = false;
        switchingTimeout:boolean = false;

        public get $e() {
            return $('.quick-sidebar');
        }

        public init() {
            this.app.debug.log('QuickSidebarComponent init');
            this.app.on('booted', () => {
                debug.log('QuickSidebarComponent received event emitted from app: booted');
            })
        }

        public boot() {
            debug.log('QuickSidebarComponent debug');
            if (!this.exists()) {
                return;
            }

            // init header button tooltips
            var ttOpts:any = _.merge(this.config('vendor.bootstrap.tooltip'), {
                placement: 'left',
                offset: '30px -40px',
                trigger: 'hover focus',
                selector: false
            });

            if (!isTouchDevice()) {
                this.$e.find('.qs-header .btn[data-quick-sidebar]').tooltip(ttOpts);
            }

            // init quick sidebar
            this._initTabs();
            this._initBindings();
            this._initResizeHandler();

            // if body class contains qs-shown which shows the quick sidebar
            // we auto select the first tab
            if (!this.isClosed()) {
                this.next();
            }
        }

        /**
         * Auto generates the heading tabs by checking all content
         * @private
         */
        protected _initTabs() {
            var self:QuickSidebarComponent = this;
            var $tabs:JQuery = this.$e.find('.qs-tabs').first();
            var style:Object = {
                width: $tabs.parent().width(),
                height: $tabs.innerHeight() - 1,
                float: 'left'
            };
            //$('<div>').css(style).appendTo($tabs);
            this.$e.find('.qs-content').each(function () {
                var tab = $('<div>')
                    .addClass('qs-tab')
                    .text($(this).attr('data-name'))
                    .attr('data-target', '#' + $(this).attr('id'));

                tab.appendTo($tabs)
            });
            $tabs.parent().jcarousel({
                list: '.qs-tabs',
                items: '.qs-tab',
                //center: true,
                wrap: 'both'
            });
            //$('<div>').css(style).appendTo($tabs);
            //$tabs.parent().scrollLeft(0);
        }

        /**
         * Initialises event bindings
         * @private
         */
        protected _initBindings() {
            var self:QuickSidebarComponent = this;

            // Binds the HTML5 data api
            $body.onClick('[data-quick-sidebar]', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $this = $(this);
                var action:string = $this.attr('data-quick-sidebar');
                var target:any = $this.attr('data-target');
                target = target || self.$e.find('.qs-content').first();

                switch (action) {
                    case 'open':
                        self.open(target);
                        break;
                    case 'close':
                        self.close();
                        break;
                    case 'pin':
                        self.isPinned() ? self.unpin() : self.pin();
                        break;
                    case 'toggle':
                        (self.isClosed() && self.open(target)) || self.close();
                        break;
                    case 'next':
                        self.next();
                        break;
                    case 'prev':
                        self.prev();
                        break;
                }

                debug.log('[data-quick-sidebar]', 'action: ', action, 'target: ', target); //, 'self: ', self, 'this: ', this);

            });

            // Blur the pressed header buttons automaticly
            $body.onClick('.quick-sidebar .qs-header button', function (e) {
                var $this = $(this);
                $this.blur();
            });

            // Clicking the heading tab names opens a new tab
            $body.onClick('.quick-sidebar .qs-tab', function (e) {
                self.open($(this).attr('data-target'));
            });

            $(document).onClick('.qs-shown', function (e) {
                //console.log(this, e);
                if ($(e.target).closest('.quick-sidebar').length > 0) {
                    return;
                }
                if (self.isPinned()) {
                    return;
                }
                self.close();
                // $(this).removeClass("c-layout-quick-sidebar-shown");
            });
        }

        protected _initResizeHandler() {
            var self:QuickSidebarComponent = this;
            var resizeHandler = function () {
                console.log('qs resize', arguments);
                if (self.isClosed()) {
                    return;
                }
                var active = self.getActive();
                self.resetContent();
                self.openTarget(active);
            };

            this.app
                .on('resize', resizeHandler)
                .on('footer:set-fixed', resizeHandler)
                .on('header:set-fixed', resizeHandler);
        }

        protected resetContent() {
            var active = this.getActive();
            if (active.length) {
                plugins.destroySlimScroll(active.removeClass('active'));
                this.$e.find('.slimScrollBar, .slimScrollRail').remove();
            }
            this.$e.find('.qs-content.active').removeClass('active');
        }

        protected openTarget($target:JQuery) {
            // making sure we're not opening something already
            if (this.switching) {
                if (this.switchingTimeout = false) {
                    setTimeout(() => {
                        this.openTarget($target);
                        this.switching = false
                    }, this.config('quickSidebar.transitionTime'));
                    this.switchingTimeout = true;
                }
                return;
            }

            var height = this.$e.outerHeight()
                - this.$e.find('.qs-header').outerHeight()
                - this.$e.find('.qs-tabs-wrapper').outerHeight()
                - this.$e.find('.qs-seperator').outerHeight();

            $target.ensureClass('active');
            $(this).addClass('.active');
            this.$e.find('.qs-tabs .qs-tab').removeClass('active');
            var $tab = this.$e.find('.qs-tabs .qs-tab[data-target="#' + $target.attr('id') + '"]').addClass('active');
            var $tabsWrapper = this.$e.find('.qs-tabs-wrapper');
            $tabsWrapper.jcarousel('scroll', $tab);

            this.switching = true;
            setTimeout(() => {
                plugins.makeSlimScroll($target, {height: height, wheelStep: isTouchDevice() ? 60 : 20});
                $target.trigger("mouseleave");
                this.switching = false;
            }, this.config('quickSidebar.transitionTime'));
        }

        public isClosed():boolean {
            return !$body.hasClass("qs-shown");
        }

        /**
         * Checks if the quick sidebar is present in the DOM
         */
        public exists():boolean {
            return this.$e.length > 0;
        }

        public getActive():JQuery {
            return this.$e.find('.qs-content.active');
        }

        public open(target:any):QuickSidebarComponent {
            if (!this.exists()) {
                return this;
            }
            if (this.$e.find(target).length == 0) {
                target = '#' + this.$e.find('.qs-content').first().attr('id');
            }
            this.resetContent();
            $body.ensureClass("qs-shown", true);
            this.openTarget(this.$e.find(target));
            return this;
        }

        public close():QuickSidebarComponent {
            if (!this.exists()) {
                return;
            }
            if (this.isPinned()) {
                this.unpin();
            }

            this.resetContent();
            $body.ensureClass("qs-shown", false);
            return this;
        }

        public next():QuickSidebarComponent {
            if (this.switching) {
                return;
            }
            var $next = this.getActive().parent().next('.qs-content:not(.active)');
            if ($next.length == 0) {
                $next = this.$e.find('.qs-content').first();
            }
            console.log('next', $next);
            this.resetContent();
            this.openTarget($next);
            return this;
        }

        public prev():QuickSidebarComponent {
            if (this.switching) {
                return;
            }
            var $prev = this.getActive().parent().prev('.qs-content:not(.active)');
            if ($prev.length == 0) {
                $prev = this.$e.find('.qs-content').last();
            }
            this.resetContent();
            this.openTarget($prev);
            return this;
        }

        public isPinned():boolean {
            return $body.hasClass('qs-pinned');
        }

        /**
         * Pin the QS so it will not close when clicking elsewhere
         */
        public pin() {
            $body.ensureClass('qs-pinned', true);
        }

        public unpin() {
            $body.removeClass('qs-pinned');
        }

    }

    Components.register('quickSidebar', QuickSidebarComponent, defaultConfig);

}
