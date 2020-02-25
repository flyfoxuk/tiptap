import { Plugin, PluginKey } from 'prosemirror-state'

class Menu {

  constructor({ options, editorView }) {
    this.options = {
      ...{
        resizeObserver: true,
        element: null,
        onUpdate: () => false,
      },
      ...options,
    }
    this.preventHide = false
    this.editorView = editorView
    this.isActive = false
    this.top = 0

    // the mousedown event is fired before blur so we can prevent it
    this.mousedownHandler = this.handleClick.bind(this)
    this.options.element.addEventListener('mousedown', this.mousedownHandler)

    this.options.editor.on('focus', ({ view }) => {
        //console.log('::FloatingMenu: editor focus event', view)
      this.update(view)
    })

    this.options.editor.on('blur', ({ event }) => {
        //console.log('::FloatingMenu: editor blur event', event)
      if (this.preventHide) {
        this.preventHide = false
        return
      }

      this.hide(event)
    })

    // sometimes we have to update the position
    // because of a loaded images for example
    if (this.options.resizeObserver && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isActive) {
          this.update(this.editorView)
        }
      })
      this.resizeObserver.observe(this.editorView.dom)
    }
  }

  handleClick() {
    //console.log('::FloatingMenu: handle click')
    this.preventHide = false  // CMB changed this to false from true because of interation with floating and bubble menus problem
  }

  update(view, lastState) {
    const { state } = view

    // Don't do anything if the document/selection didn't change
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return
    }

    if (!state.selection.empty) {
        //console.log('::FloatingMenu: stateselection not empty')
      this.hide()
      return
    }

    const currentDom = view.domAtPos(state.selection.anchor)

    const isActive = currentDom.node.innerHTML === '<br>'
      && currentDom.node.tagName === 'P'
      && currentDom.node.parentNode === view.dom

    if (!isActive) {
        console.log('::FloatingMenu: !isActive, hiding')
      this.hide()
      return
    }

    const parent = this.options.element.offsetParent

    if (!parent) {
        //console.log('::FloatingMenu: !parent, hiding')
      this.hide()
      return
    }

    const editorBoundings = parent.getBoundingClientRect()
    const cursorBoundings = view.coordsAtPos(state.selection.anchor)
    const top = cursorBoundings.top - editorBoundings.top

    this.isActive = true
    this.top = top

    this.sendUpdate()
  }

  sendUpdate() {
    this.options.onUpdate({
      isActive: this.isActive,
      top: this.top,
    })
  }

  hide(event) {
    if (event
      && event.relatedTarget
      && this.options.element.parentNode
      && this.options.element.parentNode.contains(event.relatedTarget)
    ) {
      return
    }

    this.isActive = false
    this.sendUpdate()
  }

  destroy() {
    this.options.element.removeEventListener('mousedown', this.mousedownHandler)

    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.editorView.dom)
    }
  }

}

export default function (options) {
  return new Plugin({
    key: new PluginKey('floating_menu'),
    view(editorView) {
      return new Menu({ editorView, options })
    },
  })
}
