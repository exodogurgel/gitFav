import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@favorites-github:')) || []
  }

  save() {
    localStorage.setItem('@favorites-github:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.onadd()
    this.update()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.checkForFavorites()
    this.clearInput()

    this.removeAlltr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').innerHTML = `&sol;${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove button').onclick = () => {
        const isOK = confirm('Tem Certeza que deseja apagar essa linha?')
        if (isOK) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img 
        src=""  
        alt=""
      />
      <a href="" target="_blank">
        <p></p>
        <span></span>
      </a>
    </td>
    <td class="repositories"></td>
    <td class="followers"></td>
    <td class="remove"> 
      <button>Remover</button> 
    </td>
    `

    return tr
  }

  removeAlltr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }

  checkForFavorites() {
    const noFavorites = document.querySelector('#noFavorites')
    if (this.entries.length > 0) {
      noFavorites.classList.add('sr-only')
    } else {
      noFavorites.classList.remove('sr-only')
    }
  }

  clearInput() {
    const input = document.querySelector('.search input')

    input.value = ''
    input.focus()
  }
}
