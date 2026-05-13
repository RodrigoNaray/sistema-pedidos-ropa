import { InstruccionesService } from '@/services/instrucciones.service';
import styles from './InstruccionesPago.module.css';

interface PaginaInstruccionesPagoParams {
  params: Promise<{ id: string }>;
}

export default async function PaginaInstruccionesPago({ params }: PaginaInstruccionesPagoParams) {
  const { id } = await params;

  let datos: Awaited<ReturnType<typeof InstruccionesService.obtenerInstruccionesPago>> | null = null;
  let error: string | null = null;

  try {
    datos = await InstruccionesService.obtenerInstruccionesPago(id);
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'Error al cargar las instrucciones';
    error = mensaje;
  }

  if (error) {
    return (
      <main className={styles.contenedor}>
        <div className={styles.errorBox}>
          <p className={styles.erroTexto}>No se pudieron cargar las instrucciones de pago.</p>
          <p className={styles.erroSubtexto}>{error}</p>
        </div>
      </main>
    );
  }

  if (!datos) return null;

  return (
    <main className={styles.contenedor}>
      <article className={styles.articulo}>
        <header className={styles.encabezado}>
          <h1 className={styles.titulo}>Instrucciones de pago</h1>
          <p className={styles.subtitulo}>
            Realiza la transferencia a los datos siguientes y envianos el comprobante.
          </p>
        </header>

        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Datos de transferencia</h2>

          <dl className={styles.detallesLista}>
            <div className={styles.detalleFila}>
              <dt className={styles.detalleEtiqueta}>Banco</dt>
              <dd className={styles.detalleValor}>{datos.banco}</dd>
            </div>

            <div className={styles.detalleFila}>
              <dt className={styles.detalleEtiqueta}>CBU</dt>
              <dd className={styles.detalleValor}>{datos.cbu}</dd>
            </div>

            <div className={styles.detalleFila}>
              <dt className={styles.detalleEtiqueta}>Alias</dt>
              <dd className={styles.detalleValor}>{datos.alias}</dd>
            </div>

            <div className={styles.detalleFila}>
              <dt className={styles.detalleEtiqueta}>Titular</dt>
              <dd className={styles.detalleValor}>{datos.titular}</dd>
            </div>
          </dl>
        </section>

        {datos.mensajeTransferencia && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Mensaje de la transferencia</h2>
            <p className={styles.parrafo}>{datos.mensajeTransferencia}</p>
          </section>
        )}

        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Referencia del pedido</h2>

          <div className={styles.refenciaBox}>
            <span className={styles.refenciaEtiqueta}>NÂº de pedido</span>
            <span className={styles.refenciaValor}>{datos.numeroPedido}</span>
          </div>

          <div className={styles.totalBox}>
            <span className={styles.totalEtiqueta}>Total</span>
            <span className={styles.totalValor}>{datos.totalFormateado}</span>
          </div>
        </section>

        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Enviar comprobante</h2>

          <a
            href={datos.enlaceWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBoton}
          >
            Enviar comprobante por WhatsApp
          </a>

          <p className={styles.whatsappAyuda}>
            HacÃ© clic en el botÃ³n para abrir WhatsApp con tu mensaje prellenado.
          </p>
        </section>

        <aside className={styles.notasAside}>
          <p className={styles.notasTexto}>
            Tu pedido se encuentra en estado <strong>{datos.estadoPedido}</strong>. Se confirmarÃ¡ una vez que verifiquemos el pago.
          </p>
        </aside>
      </article>
    </main>
  );
}