<script>
export default {
    data() {
        return {
            content(createElement) {
                return null;
            },
            defaultContent(createElement) {
                return null;
            },
            callback: [],
            open: false,
        };
    },
    render(createElement) {
        return createElement("div", {
            class: ["layer", this.open ? "" : "layer-hide"],
            on: {
                click: this.hide,
            }
        }, this.content.call(this, createElement));
    },
    methods: {
        show(render, callback) {
            if(render) {
                this.content = render;
            }
            if(callback) {
                this.callback.push(callback);
            }
            this.open = true;
        },
        hide() {
            this.open = false;
            const callback = this.callback;
            this.callback = [];
            for(const c of callback) {
                c();
            }
            this.content = this.defaultContent;
        }
    }
}
</script>
