class Menu {
    constructor(el, parent) {
        this.parent = parent
        this.el = el
        this.el.className = 'in-suggest__menu is-hidden'
        this.el.addEventListener('mouseenter', () => {
            this.el.classList.add('is-hover')
        })
        this.el.addEventListener('mouseleave', () => {
            this.el.classList.remove('is-hover')
        })
    }

    hidden(bool = true) {
        if (bool) this.el.classList.add('is-hidden')
        else this.el.classList.remove('is-hidden')
        this.clear()
    }

    clear() {
        this.parent.index = -1
        this.el.innerHTML = ''
    }
}

class Item {
    constructor(item, data, index, parent) {
        if (!(item instanceof HTMLElement)) return this.logError('"createItem" should be return a HTMLElement')

        this.parent = parent
        this.data = data
        this.id = index
        this.el = document.createElement('div')
        this.el.className = 'in-suggest__menu__item'
        this.el.appendChild(item)

        this.el.addEventListener('click', this.parent.click.bind(this.parent, this.data))
        this.el.addEventListener('mouseenter', () => {
            this.parent.index = index
            this.el.classList.add('is-active')
        })
        this.el.addEventListener('mouseleave', () => {
            this.parent.index = -1
            this.el.classList.remove('is-active')
        })

        this.parent.menu.el.appendChild(this.el)
    }

    active(bool = true) {
        if (!bool) {
            this.el.classList.remove('is-active')
            return
        }
        this.parent.items.forEach(item => item.active(false))
        this.el.classList.add('is-active')
    }
}

export default class InSuggest {
    constructor(id, options = {}) {
        this.input = document.getElementById(id)

        if (!this.input)
            return this.logError(`element with "${id}" is not found`)
        if (this.input.getAttribute('type') !== 'text')
            return this.logError('element input should be have type text')
        if (!options.action || !options.createItem || !options.selected)
            return this.logError('options "action", "createItem" and "selected" is required')

        const originClasses = this.input.className
        this.input.className = 'in-suggest__input'

        this.wrapper = document.createElement('div')
        this.wrapper.className = originClasses
        this.wrapper.classList.add('in-suggest')
        this.wrapper.id = this.input.id
        this.input.removeAttribute('id')

        this.menu = new Menu(document.createElement('div'), this)

        this.input.parentNode.insertBefore(this.wrapper, this.input)
        this.wrapper.appendChild(this.input)
        this.wrapper.appendChild(this.menu.el)

        this.items = []
        this.index = -1
        this.timer = null
        this.loadState = false

        this.options = options

        this.input.addEventListener('input', this.action.bind(this, options.action))
        this.input.addEventListener('keydown', this.down.bind(this))
        this.input.addEventListener('keydown', this.up.bind(this))
        this.input.addEventListener('keyup', this.enter.bind(this))
        this.input.addEventListener('keyup', this.escape.bind(this))
        this.input.addEventListener('focus', this.action.bind(this, options.action))
        this.input.addEventListener('blur', this.blur.bind(this))
    }

    blur() {
        if (!this.menu.el.classList.contains('is-hover')) this.menu.hidden()
    }

    down(e) {
        if (e.key !== 'ArrowDown') return
        if (this.index < this.items.length - 1) this.index++
        else this.index = 0
        this.items.find(item => item.id === this.index).active()
        e.preventDefault()
    }

    up(e) {
        if (e.key !== 'ArrowUp') return
        if (this.index > 0) this.index--
        else this.index = this.items.length - 1
        this.items.find(item => item.id === this.index).active()
        e.preventDefault()
    }

    enter(e) {
        if (e.key !== 'Enter' || this.index === -1 || this.loadState) return
        this.click(this.items[this.index].data)
    }

    escape(e) {
        if (e.key !== 'Escape') return
        this.input.value = ''
        this.menu.hidden()
    }

    click(item) {
        this.options.selected(item, str => {
            if (typeof str !== 'string')
                return this.logError('"click" should be return a callback with string parameter')
            this.input.value = str
            this.menu.hidden()
        })
    }

    action(callback) {
        clearTimeout(this.timer)
        this.loading(false)

        this.menu.hidden(false)

        this.loading(true)
        this.timer = setTimeout(() => {
            callback.call(this, this.input.value, results => {
                if (!Array.isArray(results)) this.items = [results]
                else this.items = results

                this.loading(false)
                this.menu.clear()
                this.items = this.items.map((item, index) =>
                    new Item(this.options.createItem.call(this, item), item, index, this)
                )
            })
        }, 200)
    }

    loading(bool) {
        this.loadState = bool
        if (bool) this.wrapper.classList.add('is-loading')
        else this.wrapper.classList.remove('is-loading')
    }

    logError(message) {
        throw new Error(`[in-suggest] ${message}`)
    }
}
