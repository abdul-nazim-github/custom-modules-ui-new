'use client'

import { useAppDispatch, useAppSelector, useAppStore } from '../lib/hooks'
import {
  decrement,
  increment,
  incrementByAmount,
  selectCount,
} from '../lib/features/counter/counterSlice'
import { useGetPokemonByNameQuery } from '../lib/services/pokemon'
import { useRef } from 'react'

export default function Home() {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const store = useAppStore()
  const initialized = useRef(false)

  // Initialize the store with a value if needed (e.g. from props)
  if (!initialized.current) {
    // store.dispatch(incrementByAmount(10))
    initialized.current = true
  }

  const { data, error, isLoading } = useGetPokemonByNameQuery('bulbasaur')

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </div>
      </div>

      <div className="my-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Redux Toolkit + Next.js App Router</h1>

        <div className="mb-8 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
          <h2 className="text-2xl mb-4">Counter Example</h2>
          <div className="flex items-center justify-center gap-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => dispatch(decrement())}
            >
              -
            </button>
            <span className="text-2xl font-bold">{count}</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => dispatch(increment())}
            >
              +
            </button>
            <button
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              onClick={() => dispatch(incrementByAmount(5))}
            >
              +5
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
          <h2 className="text-2xl mb-4">RTK Query Example</h2>
          {error ? (
            <p className="text-red-500">Oh no, there was an error</p>
          ) : isLoading ? (
            <p className="text-blue-500">Loading...</p>
          ) : data ? (
            <div className="text-left">
              <h3 className="text-xl capitalize font-bold">{data.species.name}</h3>
              <img src={data.sprites.front_shiny} alt={data.species.name} />
              <p>Height: {data.height}</p>
              <p>Weight: {data.weight}</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
