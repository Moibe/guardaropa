<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import {
    INICIALES_SEMANA,
    celdasDelMes,
    formatoLargo,
    mesDelDia,
    mesVecino,
    nombreMes
  } from '$lib/fechas';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const celdas = $derived(celdasDelMes(data.mes));

  // Las entradas del mes llegan en una sola lista; aquí se agrupan por día para
  // que el grid sepa cuántas tiene cada celda y el panel filtre sin otro query.
  const porDia = $derived.by(() => {
    const mapa = new Map<string, PageData['entradas']>();
    for (const entrada of data.entradas) {
      const lista = mapa.get(entrada.fecha);
      if (lista) lista.push(entrada);
      else mapa.set(entrada.fecha, [entrada]);
    }
    return mapa;
  });

  const delDia = $derived(porDia.get(data.dia) ?? []);

  function urlDia(iso: string) {
    return `?mes=${mesDelDia(iso)}&dia=${iso}`;
  }
  function urlMes(mes: string) {
    return `?mes=${mes}`;
  }
</script>

<svelte:head><title>Calendario · Guardaropa</title></svelte:head>

<section class="calendario">
  <div class="mes">
    <header class="mes-head">
      <a class="paso" href={urlMes(mesVecino(data.mes, -1))} aria-label="Mes anterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </a>
      <h1>{nombreMes(data.mes)}</h1>
      <a class="paso" href={urlMes(mesVecino(data.mes, 1))} aria-label="Mes siguiente">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </a>
      <a class="hoy" href={urlDia(data.hoy)}>Hoy</a>
    </header>

    <div class="semana">
      {#each INICIALES_SEMANA as inicial, i (i)}
        <span>{inicial}</span>
      {/each}
    </div>

    <div class="grid">
      {#each celdas as celda, i (celda?.iso ?? `hueco-${i}`)}
        {#if celda}
          {@const cuantas = porDia.get(celda.iso)?.length ?? 0}
          <a
            class="dia"
            class:es-hoy={celda.iso === data.hoy}
            class:activo={celda.iso === data.dia}
            href={urlDia(celda.iso)}
            aria-current={celda.iso === data.dia ? 'date' : undefined}
          >
            <span class="num">{celda.dia}</span>
            {#if cuantas}
              <span class="puntos" aria-label="{cuantas} {cuantas === 1 ? 'entrada' : 'entradas'}">
                {#each { length: Math.min(cuantas, 3) } as _, p (p)}<i></i>{/each}
              </span>
            {/if}
          </a>
        {:else}
          <span class="dia hueco"></span>
        {/if}
      {/each}
    </div>
  </div>

  <aside class="panel">
    <h2>{formatoLargo(data.dia)}</h2>

    {#if delDia.length}
      <ul class="entradas">
        {#each delDia as entrada (entrada.id)}
          <li>
            <div class="texto">
              <p class="titulo">{entrada.titulo}</p>
              {#if entrada.nota}<p class="nota">{entrada.nota}</p>{/if}
            </div>
            <form method="POST" action="?/eliminar" use:enhance>
              <input type="hidden" name="id" value={entrada.id} />
              <button class="borrar" type="submit" aria-label="Eliminar {entrada.titulo}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </form>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="vacio">Nada este día todavía.</p>
    {/if}

    <form class="alta" method="POST" action="?/agregar" use:enhance>
      <input type="hidden" name="fecha" value={data.dia} />
      <Input name="titulo" placeholder="Qué va este día" autocomplete="off" required />
      <Textarea name="nota" placeholder="Nota (opcional)" rows={3} />
      {#if form && 'error' in form}
        <p class="error">{form.error}</p>
      {/if}
      <Button type="submit">Agregar</Button>
    </form>
  </aside>
</section>

<style>
  .calendario {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 1.25rem;
    align-items: start;
    padding: 0.75rem 0.25rem 1.5rem;
  }

  /* ---- Mes ---- */

  .mes-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .mes-head h1 {
    flex: 1;
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--ink);
    text-transform: capitalize;
  }
  .paso,
  .hoy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #b91c1c;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(220, 38, 38, 0.28);
    border-radius: 9px;
    transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
  }
  .paso {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
  .hoy {
    height: 32px;
    padding: 0 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .paso:hover,
  .hoy:hover {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.5);
    color: #7f1d1d;
  }

  .semana {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 6px;
  }
  .semana span {
    text-align: center;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(24, 24, 27, 0.45);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
  }
  .dia {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 68px;
    padding: 0.4rem 0.5rem;
    box-sizing: border-box;
    color: var(--ink);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(220, 38, 38, 0.14);
    border-radius: 10px;
    transition: background 0.16s ease, border-color 0.16s ease;
  }
  .dia:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(220, 38, 38, 0.4);
  }
  .dia .num {
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
  }
  .dia.es-hoy .num {
    color: var(--red);
    font-weight: 700;
  }
  .dia.activo {
    background: rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.55);
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.16) inset;
  }
  .dia.activo .num {
    font-weight: 700;
    color: #7f1d1d;
  }
  .dia.hueco {
    background: transparent;
    border-color: transparent;
    pointer-events: none;
  }

  .puntos {
    display: flex;
    gap: 3px;
  }
  .puntos i {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--red);
  }

  /* ---- Panel del día ---- */

  .panel {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 1rem;
  }
  .panel h2 {
    margin: 0 0 0.9rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink);
    text-transform: capitalize;
  }

  .entradas {
    list-style: none;
    margin: 0 0 1rem;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .entradas li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.6rem 0;
    border-top: 1px solid rgba(220, 38, 38, 0.14);
  }
  .texto {
    flex: 1;
    min-width: 0;
  }
  .titulo {
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink);
    overflow-wrap: anywhere;
  }
  .nota {
    margin: 0.2rem 0 0;
    font-size: 0.8rem;
    color: var(--ink-soft);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .borrar {
    display: inline-flex;
    padding: 0.25rem;
    background: none;
    border: 1px solid transparent;
    border-radius: 7px;
    color: rgba(24, 24, 27, 0.4);
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
  }
  .borrar:hover {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.35);
    color: #b91c1c;
  }

  .vacio {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    color: rgba(24, 24, 27, 0.5);
  }

  .alta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(220, 38, 38, 0.14);
  }
  .error {
    margin: 0;
    font-size: 0.8rem;
    color: #b91c1c;
  }

  @media (max-width: 860px) {
    .calendario {
      grid-template-columns: minmax(0, 1fr);
    }
    .dia {
      min-height: 54px;
    }
  }
</style>
