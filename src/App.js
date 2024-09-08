import React, { useState } from 'react';
import { Chart} from 'react-google-charts';

function App() {
  const [tipoDespacho, setTipoDespacho] = useState('FiFo');
  const [procesos, setProcesos] = useState([
    { proceso: '', tiempoInicio: 0, tiempoEjecucion: 0, tiempoEspera: 0, tiempoSistema: 0 }
  ]);

  //--------------------------------------------------------------------------------

  const handleProcesoChange = (index, field, value) => {
    const updatedProcesos = [...procesos];
    updatedProcesos[index] = {
      ...updatedProcesos[index],
      [field]: value,
    };
    setProcesos(updatedProcesos);
  };

  //--------------------------------------------------------------------------------

  // Función para encontrar el proceso que cumpla con los criterios de selección
  const seleccionarProceso = (procesosDisponibles, tiempoActual) => {
    console.log(procesosDisponibles);
    console.log(tiempoActual);
    return procesosDisponibles.filter((proceso) => proceso.tiempoInicio <= tiempoActual) // Filtra procesos con tiempoInicio <= tiempoActual
      .sort((a, b) => {
        // Si hay empate en tiempo de inicio, elige el que tenga menor tiempo de ejecución
        if (a.tiempoEjecucion === b.tiempoEjecucion) {
          if (a.tiempoInicio === b.tiempoInicio) {
            return 0;
          }
          return a.tiempoInicio < b.tiempoInicio ? -1 : 1;
        }
        return a.tiempoEjecucion < b.tiempoEjecucion ? -1 : 1;
        
      })[0]; // Selecciona el primer proceso después de ordenar
  };

  const ordenarProcesos = (procesos) => {
    const nuevoOrden = [];

    // Convertir todos los valores a números
    const parseNumber = (value) => parseInt(value, 10) || 0;

    // Convertir tiempoInicio y tiempoEjecucion a números antes de comenzar
    procesos.forEach((proceso) => {
      proceso.tiempoInicio = parseNumber(proceso.tiempoInicio);
      proceso.tiempoEjecucion = parseNumber(proceso.tiempoEjecucion);
    });

    // Proceso de ordenar los procesos
    while (procesos.length > 0) {
      // En la primera iteración, selecciona el proceso con menor tiempo de inicio y tiempo de ejecución
      const tiempoActual = nuevoOrden.length === 0 
        ? Math.min(...procesos.map((proceso) => proceso.tiempoInicio)) 
        : nuevoOrden.reduce((sum, proceso) => sum + proceso.tiempoEjecucion, 0);
        
      // Selecciona el proceso que cumple con los criterios
      const procesoSeleccionado = seleccionarProceso(procesos, tiempoActual);
      
      // Agrega el proceso seleccionado al nuevo arreglo y elimínalo del arreglo original
      nuevoOrden.push(procesoSeleccionado);
      procesos = procesos.filter((proceso) => proceso !== procesoSeleccionado);
    }

    return nuevoOrden;
  };
  
  //--------------------------------------------------------------------------------

  const calcularTiempos = () => {
    if (tipoDespacho === 'FiFo' && procesos.length > 0) {
      const updatedProcesos = [...procesos];
      
      // Asegúrate de que todos los valores sean números
      const parseNumber = (value) => parseInt(value, 10) || 0;
      
      // Inicializar el primer proceso
      updatedProcesos[0] = {
        ...updatedProcesos[0],
        tiempoEspera: 0,
        tiempoSistema: parseNumber(updatedProcesos[0].tiempoEjecucion),
      };
      
      // Variable para llevar el tiempo de finalización del proceso anterior
      let tiempoFinAnterior = parseNumber(updatedProcesos[0].tiempoEjecucion);
      
      for (let i = 1; i < updatedProcesos.length; i++) {
        const tiempoEjecucionAnterior = parseNumber(updatedProcesos[i-1 >= 0 ? i-1 : 0].tiempoEjecucion);
        const tiempoEsperaAnterior = parseNumber(updatedProcesos[i-1 >= 0 ? i-1 : 0].tiempoEspera);

        const tiempoInicioActual = parseNumber(updatedProcesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(updatedProcesos[i].tiempoEjecucion);
        
        // Calcular tiempo de espera para el proceso actual
        const tiempoEspera = i === 1 ? Math.max(0, tiempoFinAnterior) : Math.max(0, tiempoEjecucionAnterior + tiempoEsperaAnterior );
        
        // Calcular tiempo de sistema para el proceso actual
        const tiempoSistema = tiempoEspera + tiempoEjecucionActual ;
        
        // Actualizar el proceso actual
        updatedProcesos[i] = {
          ...updatedProcesos[i],
          tiempoEspera: tiempoEspera,
          tiempoSistema: tiempoSistema,
        };
        
        // Actualizar el tiempo de fin para el siguiente proceso
        tiempoFinAnterior = tiempoInicioActual + tiempoSistema;
      }
      
      setProcesos(updatedProcesos);
    }

    // Algoritmo SJF (Shortest Job First)

    if (tipoDespacho === 'SJF' && procesos.length > 0) {
     
      const updatedProcesos = [...procesos];

      const SJFprocesos = ordenarProcesos(updatedProcesos);
      console.log(SJFprocesos);

    }
  };

  //--------------------------------------------------------------------------------

  const handleSelectChange = (e) => {
    const newLength = parseInt(e.target.value);
    const newProcesos = Array.from({ length: newLength }, (_, index) => ({
      proceso: `p${index + 1}`,
      tiempoInicio: 0,
      tiempoEjecucion: 0,
      tiempoEspera: 0,
      tiempoSistema: 0,
    }));
    setProcesos(newProcesos);
  };

  //--------------------------------------------------------------------------------
  
  return (
    <div className="App" style={{ width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#d8d2c6', minHeight: '100vh' }}>
      <div style={{ width: '90%', height: '6ch', background: '#377263', borderRadius: '3ch', marginTop: '1ch', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5ch' }}>Algoritmos de Despacho</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'left', flexDirection: 'column', justifyContent: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6ch', width: '100%' }}>
          <h5>Seleccione el tipo de Despacho</h5>
          <select
            value={tipoDespacho}
            onChange={(e) => setTipoDespacho(e.target.value)}
            style={{ marginTop: '.8ch', marginLeft: '1ch', borderRadius: '1ch', width: '8ch', display: 'flex', textAlign: 'center' }}
          >
            <option value="FiFo">FiFo</option>
            <option value="SJF">SJF</option>
            <option value="RR">Round Robin</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '6ch', width: '100%' }}>
          <h5>Seleccione el número de procesos</h5>
          <select
            value={procesos.length}
            onChange={handleSelectChange}
            style={{ marginTop: '.8ch', marginLeft: '1ch', borderRadius: '1ch', width: '8ch', display: 'flex', justifyContent: 'center', textAlign: 'center' }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      {((tipoDespacho === 'FiFo') || (tipoDespacho === 'SJF' ) ) && (
        <div className="tablaFifo" style={{ width: '90%', background: 'white', borderRadius: '1ch', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1ch' }}>
          <h2>Tabla de Procesos</h2>
          <table style={{ width: '90%', marginTop: '1ch', borderCollapse: 'collapse', marginBottom: '2ch' }}>
            <thead>
              <tr style={{ fontSize: '1.2ch' }}>
                <th>Proceso</th>
                <th>Tiempo de Inicio</th>
                <th>Tiempo de Ejecución</th>
                <th>Tiempo de espera</th>
                <th>Tiempo de sistema</th>
              </tr>
            </thead>
            <tbody>
              {procesos.map((proceso, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={`${proceso.proceso}`}
                      style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#f2f2f2', outline: 'none', boxShadow: 'none' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={proceso.tiempoInicio}
                      placeholder="entre un numero en segundos"
                      onChange={(e) => handleProcesoChange(index, 'tiempoInicio', e.target.value)}
                      style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'white', outline: 'none', boxShadow: 'none' }}
                    />
                    <style jsx>{`
                      input::placeholder {
                        font-size: 1.2ch; /* Cambia el tamaño de la fuente del placeholder */
                      }
                    `}</style>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={proceso.tiempoEjecucion}
                      placeholder="entre un numero en segundos"
                      onChange={(e) => handleProcesoChange(index, 'tiempoEjecucion', e.target.value)}
                      style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="click en calcular"
                      value={proceso.tiempoEspera}
                      style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={proceso.tiempoSistema}
                      placeholder="click en calcular"
                      style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                      readOnly
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {
        tipoDespacho === 'Prioridad' && (
          <div className="tablaSJF" style={{ width: '90%', background: 'white', borderRadius: '1ch', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1ch' }}>
            <h2>Tabla de Procesos</h2>
            <table style={{ width: '90%', marginTop: '1ch', borderCollapse: 'collapse', marginBottom: '2ch' }}>
              <thead>
                <tr style={{ fontSize: '1.2ch' }}>
                  <th>Proceso</th>
                  <th>Tiempo de Inicio</th>
                  <th>Tiempo de Ejecución</th>
                  <th>Tiempo de espera</th>
                  <th>Tiempo de sistema</th>
                </tr>
              </thead>
              <tbody>
                {procesos.map((proceso, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={proceso.proceso}
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#f2f2f2', outline: 'none', boxShadow: 'none' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={proceso.tiempoInicio}
                        placeholder="entre un numero en segundos"
                        onChange={(e) => handleProcesoChange(index, 'tiempoInicio', e.target.value)}
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'white', outline: 'none', boxShadow: 'none' }}
                      />
                      <style jsx>{`
                        input::placeholder {
                          font-size: 1.2ch; /* Cambia el tamaño de la fuente del placeholder */
                        }
                      `}</style>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={proceso.tiempoEjecucion}
                        placeholder="entre un numero en segundos"
                        onChange={(e) => handleProcesoChange(index, 'tiempoEjecucion', e.target.value)}
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="click en calcular"
                        value={proceso.tiempoEspera}
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={proceso.tiempoSistema}
                        placeholder="click en calcular"
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1ch' }}>
        <button
          onClick={calcularTiempos}
          style={{ width: '10ch', borderRadius: '1ch', background: 'white', color: '#377263', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', fontWeight: '600', fontSize: '3ch', padding: '.5ch', cursor: 'pointer' }}
        >
          Calcular
        </button>
      </div>
                      
      <div style={{width:'90%'}}>               
        <Chart
          width={'100%'}
          height={'400px'}
          chartType="Gantt"
          loader={<div>Loading Chart</div>}
          data={[
            [
              { type: 'string', label: 'Task ID' },
              { type: 'string', label: 'Task Name' },
              { type: 'string', label: 'Resource' },
              { type: 'date', label: 'Start Date' },
              { type: 'date', label: 'End Date' },
              { type: 'number', label: 'Duration' },
              { type: 'number', label: 'Percent Complete' },
              { type: 'string', label: 'Dependencies' },
            ],
            ...procesos.map((proceso, index) => {
              return [
                `${proceso.proceso}`,
                `${proceso.proceso}`, 
                '',
                new Date(2021, 1, 1, 0, 0, proceso.tiempoInicio ),
                new Date(2021, 1, 1, 0, 0, proceso.tiempoSistema),
                proceso.tiempoEjecucion,
                100,
                null,
              ];
            }),
          ]}
          options={{
            height: 400,
            gantt: {
              trackHeight: 30,
            },
          }}
          rootProps={{ 'data-testid': '1' }}
        />
      </div>

    </div>
  );
}

export default App;
