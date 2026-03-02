import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Filter,
  Search,
  Shield,
  SlidersHorizontal,
  Swords,
  X,
  Zap,
} from 'lucide-react'
import heroImage from './assets/img/bg-poke.jpeg'

const TYPE_THEME = {
  normal: { base: '#c85f5f', deep: '#351010' },
  fire: { base: '#ff4d4d', deep: '#540909' },
  water: { base: '#6f9eff', deep: '#121f46' },
  electric: { base: '#fcbf49', deep: '#4e2500' },
  grass: { base: '#7bc96f', deep: '#17331a' },
  ice: { base: '#79d8ff', deep: '#103249' },
  fighting: { base: '#f37272', deep: '#4a1111' },
  poison: { base: '#b37cd8', deep: '#351249' },
  ground: { base: '#d9a66c', deep: '#4b2d11' },
  flying: { base: '#9fb7ff', deep: '#1f2f59' },
  psychic: { base: '#ff6f91', deep: '#561327' },
  bug: { base: '#9db856', deep: '#2f3a10' },
  rock: { base: '#c8a85c', deep: '#403010' },
  ghost: { base: '#9d7dca', deep: '#2a183f' },
  dragon: { base: '#8176ff', deep: '#20186a' },
  dark: { base: '#8b6f6f', deep: '#1b1111' },
  steel: { base: '#b7c2d8', deep: '#27344d' },
  fairy: { base: '#f7a4c7', deep: '#4e1f35' },
}

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const ALL_TYPES = Object.keys(TYPE_THEME)
const SORT_OPTIONS = [
  { value: 'number', label: 'Numero' },
  { value: 'name', label: 'Nome' },
  { value: 'total', label: 'Total de Stats' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defesa' },
  { value: 'speed', label: 'Velocidade' },
  { value: 'weight', label: 'Peso' },
  { value: 'height', label: 'Altura' },
]
const ORDER_OPTIONS = [
  { value: 'asc', label: 'Crescente' },
  { value: 'desc', label: 'Decrescente' },
]
const LIMIT_OPTIONS = [10, 25, 50, 80, 100]
const REGION_OPTIONS = [
  { region: 'kanto', generation: 1 },
  { region: 'johto', generation: 2 },
  { region: 'hoenn', generation: 3 },
  { region: 'sinnoh', generation: 4 },
  { region: 'unova', generation: 5 },
  { region: 'kalos', generation: 6 },
  { region: 'alola', generation: 7 },
  { region: 'galar', generation: 8 },
  { region: 'paldea', generation: 9 },
]

function formatName(value) {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function statPercent(value, max = 255) {
  return Math.min(100, Math.round((value / max) * 100))
}

function multiplierLabel(value) {
  if (Number.isInteger(value)) return `x${value}`
  return `x${value.toFixed(2)}`
}

function getTypeTheme(type) {
  return TYPE_THEME[type] ?? { base: '#ef4444', deep: '#2f1212' }
}

function getCardVars(types) {
  const first = getTypeTheme(types?.[0])
  const second = getTypeTheme(types?.[1] ?? types?.[0])
  return {
    '--card-accent': first.base,
    '--card-gradient': `linear-gradient(148deg, ${first.deep} 0%, #0a0909 48%, ${second.deep} 100%)`,
    '--card-glow': `radial-gradient(circle at 85% -5%, ${first.base}99 0%, transparent 55%)`,
    '--stat-gradient': `linear-gradient(90deg, ${first.base}, ${second.base})`,
  }
}

function getAttackMultiplier(attackerType, defenderTypes) {
  return defenderTypes.reduce(
    (accumulator, defenderType) => accumulator * (TYPE_CHART[attackerType]?.[defenderType] ?? 1),
    1,
  )
}

function getDefensiveWeaknesses(pokemonTypes) {
  return ALL_TYPES.map((attackType) => ({
    type: attackType,
    multiplier: getAttackMultiplier(attackType, pokemonTypes),
  }))
    .filter((entry) => entry.multiplier > 1)
    .sort((a, b) => b.multiplier - a.multiplier)
}

function getOffensiveAdvantages(pokemonTypes) {
  return ALL_TYPES.map((defenderType) => ({
    type: defenderType,
    multiplier: Math.max(...pokemonTypes.map((attackType) => getAttackMultiplier(attackType, [defenderType]))),
  }))
    .filter((entry) => entry.multiplier > 1)
    .sort((a, b) => b.multiplier - a.multiplier)
}

function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function onPointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    function onEsc(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div className={`dropdown ${open ? 'open' : ''}`} ref={wrapperRef}>
      <button className='dropdown-trigger' type='button' onClick={() => setOpen((current) => !current)}>
        <span>{selected?.label ?? '-'}</span>
        <ChevronDown size={15} />
      </button>
      {open ? (
        <div className='dropdown-menu'>
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              className={`dropdown-option ${option.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatPill({ label, value, icon }) {
  const percent = statPercent(value)
  return (
    <div className='stat-pill'>
      <div className='stat-pill-head'>
        <span className='stat-pill-label'>
          {icon}
          {label}
        </span>
        <strong className='stat-pill-value'>
          {value}
          <small>{percent}%</small>
        </strong>
      </div>
      <div className='stat-track'>
        <div className='stat-fill' style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function PokemonCard({ pokemon, onOpen }) {
  const cardVars = getCardVars(pokemon.types)
  return (
    <article
      className='pokemon-card'
      style={cardVars}
      onClick={() => onOpen(pokemon)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(pokemon)
        }
      }}
      aria-label={`Ver detalhes de ${pokemon.displayName}`}
    >
      <header className='pokemon-card-header'>
        <p className='pokemon-number'>#{String(pokemon.number).padStart(4, '0')}</p>
        <p className='pokemon-region'>{pokemon.region}</p>
      </header>
      <img src={pokemon.image ?? ''} alt={pokemon.displayName} className='pokemon-image' loading='lazy' />
      <h3>{pokemon.displayName}</h3>
      <div className='type-row'>
        {pokemon.types.map((type) => {
          const theme = getTypeTheme(type)
          return (
            <span
              key={`${pokemon.number}-${type}`}
              className='type-badge'
              style={{ backgroundColor: theme.base, borderColor: theme.base }}
            >
              {formatName(type)}
            </span>
          )
        })}
      </div>
      <footer className='pokemon-card-footer'>
        <span>Clique para detalhes</span>
      </footer>
    </article>
  )
}

function App() {
  const [searchValue, setSearchValue] = useState('')
  const [types, setTypes] = useState([])
  const [regions, setRegions] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    origin: 'all',
    sortBy: 'number',
    order: 'asc',
    limit: 25,
    page: 1,
  })
  const [response, setResponse] = useState({
    items: [],
    meta: null,
    dataset: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  const regionCounts = useMemo(
    () => Object.fromEntries(regions.map((item) => [item.region, item.count])),
    [regions],
  )

  const typeDropdownOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos os tipos' },
      ...types.map((item) => ({
        value: item.type,
        label: `${formatName(item.type)} (${item.count})`,
      })),
    ],
    [types],
  )

  const originDropdownOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas as origens' },
      ...REGION_OPTIONS.map((item) => ({
        value: `region:${item.region}`,
        label: `${formatName(item.region)} (Gen ${item.generation})${
          regionCounts[item.region] ? ` (${regionCounts[item.region]})` : ''
        }`,
      })),
    ],
    [regionCounts],
  )

  const weaknesses = useMemo(
    () => (selectedPokemon ? getDefensiveWeaknesses(selectedPokemon.types) : []),
    [selectedPokemon],
  )
  const offensiveAdvantages = useMemo(
    () => (selectedPokemon ? getOffensiveAdvantages(selectedPokemon.types) : []),
    [selectedPokemon],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.page === 1 ? current : { ...current, page: 1 }))
    }, 260)
    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    let ignore = false
    async function loadFilters() {
      try {
        const [typesResponse, regionsResponse] = await Promise.all([fetch('/api/types'), fetch('/api/regions')])
        if (!typesResponse.ok || !regionsResponse.ok) {
          throw new Error('Nao foi possivel carregar filtros da API.')
        }
        const typesPayload = await typesResponse.json()
        const regionsPayload = await regionsResponse.json()
        if (ignore) return
        setTypes(typesPayload.items ?? [])
        setRegions(regionsPayload.items ?? [])
      } catch (fetchError) {
        if (ignore) return
        setError(fetchError.message)
      }
    }
    loadFilters()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    async function loadPokemon() {
      setLoading(true)
      setError('')
      try {
        const query = new URLSearchParams({
          page: String(filters.page),
          limit: String(filters.limit),
          sortBy: filters.sortBy,
          order: filters.order,
        })
        const normalizedSearch = searchValue.trim()
        if (normalizedSearch) query.set('q', normalizedSearch)
        if (filters.type !== 'all') query.set('type', filters.type)
        if (filters.origin !== 'all') {
          const [, originValue] = filters.origin.split(':')
          if (originValue) query.set('region', originValue)
        }
        const result = await fetch(`/api/pokemon?${query.toString()}`, { signal: controller.signal })
        if (!result.ok) throw new Error('Erro ao carregar Pokemon da API.')
        const payload = await result.json()
        if (ignore) return
        setResponse({
          items: payload.items ?? [],
          meta: payload.meta ?? null,
          dataset: payload.dataset ?? null,
        })
      } catch (fetchError) {
        if (fetchError.name === 'AbortError' || ignore) return
        setError(fetchError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadPokemon()
    return () => {
      ignore = true
      controller.abort()
    }
  }, [filters, searchValue])

  const hasPrevious = response.meta?.hasPrevious ?? false
  const hasNext = response.meta?.hasNext ?? false

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: key === 'limit' ? Number(value) : value,
      page: key === 'page' ? value : 1,
    }))
    setSelectedPokemon(null)
  }

  useEffect(() => {
    function onEscape(event) {
      if (event.key === 'Escape') setSelectedPokemon(null)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = selectedPokemon ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedPokemon])

  return (
    <main className='app-shell'>
      <header className='hero-banner' style={{ backgroundImage: `url(${heroImage})` }}>
        <div className='hero-overlay' />
        <div className='hero-content'>
          <h1 className='logo-title'>
            Poke<span>Dex</span>
          </h1>
          <p className='hero-description'>Explore, filtre e descubra Pokemon de todas as regioes.</p>
          <form className='hero-search' onSubmit={(event) => event.preventDefault()}>
            <Search size={18} />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Busque por nome, numero ou #id...'
            />
            <button type='submit'>Buscar</button>
          </form>
        </div>
      </header>

      <section className='control-panel'>
        <div className='filter-chip'>
          <div className='filter-chip-title'>
            <Filter size={14} />
            Tipo
          </div>
          <Dropdown options={typeDropdownOptions} value={filters.type} onChange={(value) => updateFilter('type', value)} />
        </div>
        <div className='filter-chip'>
          <div className='filter-chip-title'>
            <SlidersHorizontal size={14} />
            Regiao e Geracao
          </div>
          <Dropdown options={originDropdownOptions} value={filters.origin} onChange={(value) => updateFilter('origin', value)} />
        </div>
        <div className='filter-chip'>
          <div className='filter-chip-title'>
            <ArrowDownUp size={14} />
            Ordenar por
          </div>
          <Dropdown options={SORT_OPTIONS} value={filters.sortBy} onChange={(value) => updateFilter('sortBy', value)} />
        </div>
        <div className='filter-chip'>
          <div className='filter-chip-title'>
            <ChevronsUpDown size={14} />
            Ordem
          </div>
          <Dropdown options={ORDER_OPTIONS} value={filters.order} onChange={(value) => updateFilter('order', value)} />
        </div>
        <div className='filter-chip'>
          <div className='filter-chip-title'>
            <Activity size={14} />
            Itens por pagina
          </div>
          <Dropdown
            options={LIMIT_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
            value={String(filters.limit)}
            onChange={(value) => updateFilter('limit', value)}
          />
        </div>
      </section>

      {error ? <p className='feedback error'>{error}</p> : null}
      {loading ? <p className='feedback loading'>Carregando dados da Pokedex...</p> : null}

      {!loading && !error ? (
        <section className='results-grid'>
          {response.items.length === 0 ? (
            <p className='feedback'>Nenhum Pokemon encontrado para esses filtros.</p>
          ) : (
            response.items.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} onOpen={setSelectedPokemon} />
            ))
          )}
        </section>
      ) : null}

      <footer className='pagination'>
        <button
          disabled={!hasPrevious || loading}
          onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <span>
          Pagina {response.meta?.page ?? 1} de {response.meta?.totalPages ?? 1}
        </span>
        <button disabled={!hasNext || loading} onClick={() => updateFilter('page', filters.page + 1)}>
          Proxima
          <ChevronRight size={16} />
        </button>
      </footer>

      <p className='site-credit'>Desenvolvido por: Bernardo Cavalheiro, Pedro Schuenck, Roberto Alaluna.</p>

      {selectedPokemon ? (
        <div className='modal-overlay' onClick={() => setSelectedPokemon(null)}>
          <div className='pokemon-modal' style={getCardVars(selectedPokemon.types)} onClick={(event) => event.stopPropagation()}>
            <button className='modal-close' onClick={() => setSelectedPokemon(null)} aria-label='Fechar detalhes'>
              <X size={18} />
            </button>
            <div className='modal-head'>
              <img src={selectedPokemon.image ?? ''} alt={selectedPokemon.displayName} />
              <div>
                <h2>
                  {selectedPokemon.displayName} <small>#{String(selectedPokemon.number).padStart(4, '0')}</small>
                </h2>
                <p>
                  {selectedPokemon.region} - Geracao {selectedPokemon.generation ?? '-'}
                </p>
                <div className='type-row'>
                  {selectedPokemon.types.map((type) => {
                    const theme = getTypeTheme(type)
                    return (
                      <span
                        key={`modal-${selectedPokemon.id}-${type}`}
                        className='type-badge'
                        style={{ backgroundColor: theme.base, borderColor: theme.base }}
                      >
                        {formatName(type)}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className='modal-subtitle'>
              <Activity size={15} />
              <span>Distribuicao de stats</span>
            </div>

            <div className='stat-grid'>
              <StatPill label='HP' value={selectedPokemon.stats.hp} icon={<Shield size={13} />} />
              <StatPill label='ATK' value={selectedPokemon.stats.attack} icon={<Swords size={13} />} />
              <StatPill label='DEF' value={selectedPokemon.stats.defense} icon={<Shield size={13} />} />
              <StatPill label='SPD' value={selectedPokemon.stats.speed} icon={<Zap size={13} />} />
            </div>

            <section className='effect-grid'>
              <div className='effect-box weak'>
                <h4>Fraquezas</h4>
                <div className='effect-list'>
                  {weaknesses.length > 0 ? (
                    weaknesses.slice(0, 8).map((entry) => (
                      <span key={`weak-${entry.type}`} className='effect-pill'>
                        {formatName(entry.type)} {multiplierLabel(entry.multiplier)}
                      </span>
                    ))
                  ) : (
                    <span className='effect-empty'>Sem fraquezas relevantes.</span>
                  )}
                </div>
              </div>

              <div className='effect-box strong'>
                <h4>Vantagens</h4>
                <div className='effect-list'>
                  {offensiveAdvantages.length > 0 ? (
                    offensiveAdvantages.slice(0, 8).map((entry) => (
                      <span key={`adv-${entry.type}`} className='effect-pill'>
                        {formatName(entry.type)} {multiplierLabel(entry.multiplier)}
                      </span>
                    ))
                  ) : (
                    <span className='effect-empty'>Sem vantagens marcantes.</span>
                  )}
                </div>
              </div>
            </section>

            <div className='detail-meta'>
              <span>Total: {selectedPokemon.stats.total}</span>
              <span>Altura: {selectedPokemon.height.toFixed(1)} m</span>
              <span>Peso: {selectedPokemon.weight.toFixed(1)} kg</span>
              <span>Base EXP: {selectedPokemon.baseExperience ?? '-'}</span>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
