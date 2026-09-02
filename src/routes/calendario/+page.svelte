<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import {
    INICIALES_SEMANA,
    celdasDelMes,
    formatoLargo,
    mesDelDia,
    mesVecino,
    nombreMes
  } from '$lib/fechas';
  import { ETIQUETA_TIPO, ICONO_TIPO, TIPOS_PRENDA, esCobertor, slotsCubiertos } from '$lib/prendas';
  import type { TipoPrenda } from '$lib/prendas';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const celdas = $derived(celdasDelMes(data.mes));

  // Los vestuarios del mes llegan en una sola lista; aquí se agrupan por fecha para
  // que el grid sepa cuántos tiene cada celda y el panel filtre sin otro query.
  const porFecha = $derived.by(() => {
    const mapa = new Map<string, PageData['vestuarios']>();
    for (const vestuario of data.vestuarios) {
      const lista = mapa.get(vestuario.fecha);
      if (lista) lista.push(vestuario);
      else mapa.set(vestuario.fecha, [vestuario]);
    }
    return mapa;
  });

  const piezasPorVestuario = $derived.by(() => {
    const mapa = new Map<number, PageData['piezas']>();
    for (const pieza of data.piezas) {
      const lista = mapa.get(pieza.vestuarioId);
      if (lista) lista.push(pieza);
      else mapa.set(pieza.vestuarioId, [pieza]);
    }
    return mapa;
  });

  const delDia = $derived(porFecha.get(data.dia) ?? []);

  /**
   * Qué slots quedan cubiertos por un cobertor (vestido, overol) y por cuál. Solo
   * se usa para explicar los slots que quedaron vacíos: si además pusiste algo en
   * ese slot, manda la prenda.
   */
  function cobertura(piezas: PageData['piezas']) {
    const mapa = new Map<TipoPrenda, string[]>();
    for (const pieza of piezas) {
      if (!esCobertor(pieza.tipo)) continue;
      for (const slot of slotsCubiertos(pieza.tipo)) {
        const lista = mapa.get(slot);
        if (lista) lista.push(pieza.nombre);
        else mapa.set(slot, [pieza.nombre]);
      }
    }
    return mapa;
  }

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
          {@const cuantos = porFecha.get(celda.iso)?.length ?? 0}
          <a
            class="dia"
            class:es-hoy={celda.iso === data.hoy}
            class:activo={celda.iso === data.dia}
            href={urlDia(celda.iso)}
            aria-current={celda.iso === data.dia ? 'date' : undefined}
          >
            <span class="num">{celda.dia}</span>
            {#if cuantos}
              <span class="puntos" aria-label="{cuantos} {cuantos === 1 ? 'vestuario' : 'vestuarios'}">
                {#each { length: Math.min(cuantos, 3) } as _, p (p)}<i></i>{/each}
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

    {#if form && 'error' in form}
      <p class="error">{form.error}</p>
    {/if}

    {#each delDia as vestuario (vestuario.id)}
      {@const piezas = piezasPorVestuario.get(vestuario.id) ?? []}
      {@const cubiertos = cobertura(piezas)}
      <article class="vestuario">
        <header>
          <h3>{vestuario.etiqueta ?? 'Vestuario'}</h3>
          <form method="POST" action="?/eliminarVestuario" use:enhance>
            <input type="hidden" name="id" value={vestuario.id} />
            <button class="borrar" type="submit" aria-label="Eliminar vestuario">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </form>
        </header>

        <ul class="slots">
          {#each TIPOS_PRENDA as tipo (tipo)}
            {@const delSlot = piezas.filter((p) => p.tipo === tipo)}
            <!-- Vestido y overol solo aparecen si traen algo: si no, serían dos
                 renglones en "—" casi todos los días. -->
            {#if delSlot.length || !esCobertor(tipo)}
              <li class:sin-nada={delSlot.length === 0}>
                <span class="slot">
                  <span class="ico" aria-hidden="true">{ICONO_TIPO[tipo]}</span>
                  {ETIQUETA_TIPO[tipo]}
                </span>
                {#if delSlot.length}
                  <span class="puestas">
                    {#each delSlot as pieza (pieza.id)}
                      <span class="chip">
                        {pieza.nombre}
                        <form method="POST" action="?/quitarPrenda" use:enhance>
                          <input type="hidden" name="id" value={pieza.id} />
                          <button type="submit" aria-label="Quitar {pieza.nombre}">×</button>
                        </form>
                      </span>
                    {/each}
                  </span>
                {:else if cubiertos.has(tipo)}
                  <span class="cubierto">cubierto por {cubiertos.get(tipo)?.join(', ')}</span>
                {:else}
                  <span class="nada">—</span>
                {/if}
              </li>
            {/if}
          {/each}
        </ul>

        {#if data.catalogo.length}
          <form class="poner" method="POST" action="?/agregarPrenda" use:enhance>
            <input type="hidden" name="vestuarioId" value={vestuario.id} />
            <select name="prendaId" required>
              <option value="" selected>Poner prenda…</option>
              {#each TIPOS_PRENDA as tipo (tipo)}
                {@const opciones = data.catalogo.filter((p) => p.tipo === tipo)}
                {#if opciones.length}
                  <optgroup label="{ICONO_TIPO[tipo]} {ETIQUETA_TIPO[tipo]}">
                    {#each opciones as prenda (prenda.id)}
                      <option value={prenda.id}>{prenda.nombre}</option>
                    {/each}
                  </optgroup>
                {/if}
              {/each}
            </select>
            <button class="chico" type="submit">Poner</button>
          </form>
        {/if}
      </article>
    {:else}
      <p class="vacio">Nada este día todavía.</p>
    {/each}

    {#if data.catalogo.length === 0}
      <p class="aviso">
        Tu guardarropa está vacío. Da de alta prendas en
        <a href="/guardarropa">Guardarropa</a> y luego arma el vestuario aquí.
      </p>
    {/if}

    <form class="nuevo" method="POST" action="?/crearVestuario" use:enhance>
      <input type="hidden" name="fecha" value={data.dia} />
      <Input name="etiqueta" placeholder="Etiqueta: día, noche, gym… (opcional)" autocomplete="off" />
      <Button type="submit">
        {delDia.length ? 'Otro vestuario este día' : 'Crear vestuario'}
      </Button>
    </form>
  </aside>
</section>

<style>
  .calendario {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
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

  .vestuario {
    margin-bottom: 0.9rem;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid rgba(220, 38, 38, 0.14);
  }
  .vestuario header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .vestuario h3 {
    flex: 1;
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #b91c1c;
  }

  .slots {
    list-style: none;
    margin: 0 0 0.6rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
  }
  .slots li {
    display: grid;
    grid-template-columns: 9.5rem minmax(0, 1fr);
    gap: 0.5rem;
    align-items: baseline;
  }
  .slot {
    font-size: 0.72rem;
    color: rgba(24, 24, 27, 0.45);
  }
  .ico {
    font-size: 0.9rem;
  }
  .slots li.sin-nada .slot {
    color: rgba(24, 24, 27, 0.28);
  }
  .nada {
    font-size: 0.8rem;
    color: rgba(24, 24, 27, 0.25);
  }
  .cubierto {
    font-size: 0.72rem;
    font-style: italic;
    color: rgba(24, 24, 27, 0.38);
    overflow-wrap: anywhere;
  }

  .puestas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.12rem 0.25rem 0.12rem 0.5rem;
    font-size: 0.78rem;
    color: var(--ink);
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.24);
    border-radius: 999px;
    overflow-wrap: anywhere;
  }
  .chip button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1;
    color: rgba(24, 24, 27, 0.4);
    background: none;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease;
  }
  .chip button:hover {
    background: rgba(220, 38, 38, 0.25);
    color: #7f1d1d;
  }

  .poner {
    display: flex;
    gap: 0.35rem;
  }
  .poner select {
    flex: 1;
    min-width: 0;
    height: 30px;
    padding: 0 0.4rem;
    font: inherit;
    font-size: 0.8rem;
    color: var(--ink);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 8px;
  }
  .chico {
    padding: 0.22rem 0.6rem;
    font: inherit;
    font-size: 0.78rem;
    color: rgba(24, 24, 27, 0.6);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
  }
  .chico:hover {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.45);
    color: #b91c1c;
  }

  .borrar {
    display: inline-flex;
    padding: 0.2rem;
    background: none;
    border: 1px solid transparent;
    border-radius: 7px;
    color: rgba(24, 24, 27, 0.35);
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
  }
  .borrar:hover {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.35);
    color: #b91c1c;
  }

  .vacio,
  .aviso {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    line-height: 1.45;
    color: rgba(24, 24, 27, 0.5);
  }
  .aviso a {
    color: #b91c1c;
  }
  .error {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    color: #b91c1c;
  }

  .nuevo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(220, 38, 38, 0.14);
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
