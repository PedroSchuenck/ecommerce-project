import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import './style.modules.css'

export function HeaderDefault() {
  const [pikachuSprite, setPikachuSprite] = useState('')
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    async function loadPikachu() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Falha ao carregar o Pikachu')
        }

        const sprite =
          data?.sprites?.other?.['official-artwork']?.front_default ||
          data?.sprites?.front_default ||
          ''

        setPikachuSprite(sprite)
      } catch {
        setPikachuSprite('')
      }
    }

    loadPikachu()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <header className='containerHeader'>
      <div className='divHeader'>
        <div className='titleRow'>
          <h1>
            Poke<span className='spanH1'>Dex</span>
          </h1>
          {pikachuSprite ? (
            <img className='pikachuTitle' src={pikachuSprite} alt='Pikachu' loading='lazy' />
          ) : null}
        </div>

        <span className='span-sub'>
          Explore o universo Pokemon.
          <br />
          Pesquise, descubra e monte seu time ideal.
        </span>

        <form className='divSearch' onSubmit={handleSubmit}>
          <div className='search'>
            <Search size={18} />
            <input
              type='text'
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Busque por nome, numero ou #id...'
              aria-label='Buscar Pokemon'
            />
            <button type='submit'>Buscar</button>
          </div>
        </form>
      </div>
    </header>
  )
}
