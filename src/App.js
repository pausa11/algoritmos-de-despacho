import React, { useState } from 'react';
import { Chart} from 'react-google-charts';

function App() {
  const [tipoDespacho, setTipoDespacho] = useState('FiFo');
  const [procesos, setProcesos] = useState([
    { proceso: 'p1', tiempoInicio: 0, tiempoEjecucion: 0, tiempoEspera: 0, tiempoSistema: 0,prioridad: 0 }
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

  const seleccionarProcesoSFJ = (procesosDisponibles, tiempoActual) => {
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
        
      })[0]; 
  };

  const ordenarProcesosSFJ = (procesos) => {
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
      const procesoSeleccionado = seleccionarProcesoSFJ(procesos, tiempoActual);
      
      // Agrega el proceso seleccionado al nuevo arreglo y elimínalo del arreglo original
      nuevoOrden.push(procesoSeleccionado);
      procesos = procesos.filter((proceso) => proceso !== procesoSeleccionado);
    }

    return nuevoOrden;
  };

  //--------------------------------------------------------------------------------

  const ordenarProcesosPrioridad = (procesos) => {
    const nuevoOrden = [];

    // Convertir todos los valores a números
    const parseNumber = (value) => parseInt(value, 10) || 0;

    // Convertir tiempoInicio y prioridad a números antes de comenzar
    procesos.forEach((proceso) => {
      proceso.tiempoInicio = parseNumber(proceso.tiempoInicio);
      proceso.prioridad = parseNumber(proceso.prioridad);
      proceso.tiempoEjecucion = parseNumber(proceso.tiempoEjecucion);
    });

    // Proceso de ordenar los procesos
    while (procesos.length > 0) {
      // En la primera iteración, selecciona el proceso con menor tiempo de inicio y menor prioridad
      const tiempoActual = nuevoOrden.length === 0
        ? Math.min(...procesos.map((proceso) => proceso.tiempoInicio))
        : nuevoOrden.reduce((sum, proceso) => sum + proceso.tiempoEjecucion, 0);

      // Selecciona el proceso que cumple con los criterios
      const procesoSeleccionado = procesos.filter((proceso) => proceso.tiempoInicio <= tiempoActual)
        .sort((a, b) => {
          // Si hay empate en tiempo de inicio, elige el que tenga menor prioridad
          if (a.prioridad === b.prioridad) {
            if (a.tiempoInicio === b.tiempoInicio) {
              return 0;
            }
            return a.tiempoInicio < b.tiempoInicio ? -1 : 1;
          }
          return a.prioridad < b.prioridad ? -1 : 1;
        })[0]; // Selecciona el primer proceso después de ordenar

      // Agrega el proceso seleccionado al nuevo arreglo y elimínalo del arreglo original
      nuevoOrden.push(procesoSeleccionado);
      procesos = procesos.filter((proceso) => proceso !== procesoSeleccionado);
    }

    return nuevoOrden;
  }
  
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

    else if (tipoDespacho === 'SJF' && procesos.length > 0) {
     
      const updatedProcesos = [...procesos];

      const SJFprocesos = ordenarProcesosSFJ(updatedProcesos);
      console.log(SJFprocesos);
      
      // Asegúrate de que todos los valores sean números
      const parseNumber = (value) => parseInt(value, 10) || 0;

      // Inicializar el primer proceso
      SJFprocesos[0] = {
        ...SJFprocesos[0],
        tiempoEspera: 0,
        tiempoSistema: parseNumber(SJFprocesos[0].tiempoEjecucion),
      };

      // Variable para llevar el tiempo de finalización del proceso anterior
      let tiempoFinAnterior = parseNumber(SJFprocesos[0].tiempoEjecucion);

      for (let i = 1; i < SJFprocesos.length; i++) {
        const tiempoEjecucionAnterior = parseNumber(SJFprocesos[i-1 >= 0 ? i-1 : 0].tiempoEjecucion);
        const tiempoEsperaAnterior = parseNumber(SJFprocesos[i-1 >= 0 ? i-1 : 0].tiempoEspera);

        const tiempoInicioActual = parseNumber(SJFprocesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(SJFprocesos[i].tiempoEjecucion);

        // Calcular tiempo de espera para el proceso actual
        const tiempoEspera = i === 1 ? Math.max(0, tiempoFinAnterior) : Math.max(0, tiempoEjecucionAnterior + tiempoEsperaAnterior );

        // Calcular tiempo de sistema para el proceso actual
        const tiempoSistema = tiempoEspera + tiempoEjecucionActual ;

        // Actualizar el proceso actual
        SJFprocesos[i] = {
          ...SJFprocesos[i],
          tiempoEspera: tiempoEspera,
          tiempoSistema: tiempoSistema,
        };

        // Actualizar el tiempo de fin para el siguiente proceso
        tiempoFinAnterior = tiempoInicioActual + tiempoSistema;
      }
      setProcesos(SJFprocesos);
    }

    else if (tipoDespacho === 'Prioridad' && procesos.length > 0) {
      console.log('entro');
      const updatedProcesos = [...procesos];

      const prioridadProcesos = ordenarProcesosPrioridad(updatedProcesos);
      console.log(prioridadProcesos);
      
      // Asegúrate de que todos los valores sean números
      const parseNumber = (value) => parseInt(value, 10) || 0;

      // Inicializar el primer proceso
      prioridadProcesos[0] = {
        ...prioridadProcesos[0],
        tiempoEspera: 0,
        tiempoSistema: parseNumber(prioridadProcesos[0].tiempoEjecucion),
      };

      // Variable para llevar el tiempo de finalización del proceso anterior
      let tiempoFinAnterior = parseNumber(prioridadProcesos[0].tiempoEjecucion);

      for (let i = 1; i < prioridadProcesos.length; i++) {
        const tiempoEjecucionAnterior = parseNumber(prioridadProcesos[i-1 >= 0 ? i-1 : 0].tiempoEjecucion);
        const tiempoEsperaAnterior = parseNumber(prioridadProcesos[i-1 >= 0 ? i-1 : 0].tiempoEspera);

        const tiempoInicioActual = parseNumber(prioridadProcesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(prioridadProcesos[i].tiempoEjecucion);

        // Calcular tiempo de espera para el proceso actual
        const tiempoEspera = i === 1 ? Math.max(0, tiempoFinAnterior) : Math.max(0, tiempoEjecucionAnterior + tiempoEsperaAnterior );

        // Calcular tiempo de sistema para el proceso actual
        const tiempoSistema = tiempoEspera + tiempoEjecucionActual ;

        // Actualizar el proceso actual
        prioridadProcesos[i] = {
          ...prioridadProcesos[i],
          tiempoEspera: tiempoEspera,
          tiempoSistema: tiempoSistema,
        };

        // Actualizar el tiempo de fin para el siguiente proceso
        tiempoFinAnterior = tiempoInicioActual + tiempoSistema;
      }
      setProcesos(prioridadProcesos);
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
      
      <div className='Titulo' style={{ width: '90%', height: '6ch', background: '#375d72', borderRadius: '3ch', marginTop: '1ch', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5ch' ,letterSpacing:'.1vw'}}>Algoritmos de Despacho</h1>
      </div>

      <div className='seleccionDeOPciones' style={{ display: 'flex', alignItems: 'left', flexDirection: 'column', justifyContent: 'left' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6ch', width: '100%' }}>
          <h5 style={{fontWeight:'400'}}>Seleccione el tipo de Despacho</h5>
          <select
            value={tipoDespacho}
            onChange={(e) => setTipoDespacho(e.target.value)}
            style={{ marginTop: '.8ch', marginLeft: '1ch', borderRadius: '1ch', width: '12ch', display: 'flex', textAlign: 'center' }}
          >
            <option value="FiFo">FiFo</option>
            <option value="SJF">SJF</option>
            <option value="Prioridad">Prioridad</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '6ch', width: '100%' }}>
          <h5 style={{fontWeight:'400'}}>Seleccione el número de procesos</h5>
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

      <div className="tabla" style={{ width: '90%', background: 'white', borderRadius: '1ch', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1ch' }}>
        <h2>Tabla de Procesos</h2>
        <table style={{ width: '90%', marginTop: '1ch', borderCollapse: 'collapse', marginBottom: '2ch' }}>
          <thead>
            <tr style={{ fontSize: '1.2ch'}}>
              <th style={{fontWeight:'400'}}>Proceso</th>
              <th style={{fontWeight:'400'}}>Tiempo de Inicio</th>
              <th style={{fontWeight:'400'}}>Tiempo de Ejecución</th>
              {
                tipoDespacho === 'Prioridad' && (
                  <th style={{fontWeight:'400'}}>Prioridad</th>
                )
              }
              <th style={{fontWeight:'400'}}>Tiempo de espera</th>
              <th style={{fontWeight:'400'}}>Tiempo de sistema</th>
            </tr>
          </thead>
          <tbody>
            {procesos.map((proceso, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={`${proceso.proceso}`}
                    onChange={(e) => handleProcesoChange(index, 'proceso', e.target.value)}
                    style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#523772', outline: 'none', boxShadow: 'none',color:'white',fontWeight:'600' }}
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
                  <style jsx ="true">{`
                    input::placeholder {
                      font-size: 1.2ch;
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
                {
                  tipoDespacho === 'Prioridad' && (
                    <td>
                      <input
                        type="number"
                        value={proceso.prioridad}
                        placeholder="entre un numero"
                        onChange={(e) => handleProcesoChange(index, 'prioridad', e.target.value)}
                        style={{ width: '100%', height: '4ch', border: '.1vh solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' }}
                      />
                    </td>
                  )
                }
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
      
      <div className='calcular' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1ch' }}>
        <button
          onClick={calcularTiempos}
          style={{ width: '10ch', borderRadius: '1ch', background: 'white', color: '#375d72', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', fontWeight: '600', fontSize: '3ch', padding: '.5ch', cursor: 'pointer' }}
        >
          Calcular
        </button>
      </div>
                      
      <div className='diagramaDegantt' style={{width:'90%',marginBottom:'5ch',borderRadius:'2ch',background:'white',height:'30ch',padding:'1ch'}}>               
        <Chart
          width={'100%'}
          height={'25ch'}
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
            ...procesos.map((proceso) => {
              // console.log(proceso);
              return [
                `${proceso.proceso}`,
                `${proceso.proceso}`, 
                '',
                new Date(2021, 1, 1, 0, 0, proceso.tiempoEspera ),
                new Date(2021, 1, 1, 0, 0, proceso.tiempoSistema),
                proceso.tiempoEjecucion,
                100,
                null,
              ];
            }),
          ]}
          options={{
            gantt: {
              trackHeight: 30,
              palette: [
                {
                  color: '#377263', // Color de la tarea
                  dark: '#377263', // Color de la sombra de la tarea
                  light: '#377263', // Color del área libre
                },
              ],
              criticalPathEnabled: false, // Desactiva la ruta crítica si no la necesitas
              arrow: {
                angle: 45, // Ángulo de las flechas entre tareas
                width: 2, // Ancho de las flechas
                color: 'red' // Color de las flechas
              },
            },
            backgroundColor: 'red', // Color de fondo del gráfico
            fontName: 'Arial', // Tipo de fuente
            fontSize: 12, // Tamaño de la fuente
            hAxis: {
              textStyle: {
                color: 'red', // Color de los textos en el eje horizontal
                fontName: 'Arial',
                fontSize: 12,
              },
            },
            vAxis: {
              textStyle: {
                color: 'red', // Color de los textos en el eje vertical
                fontName: 'Arial',
                fontSize: 12,
              },
            },
          }}
        />
      </div>

    </div>
  );
}

export default App;
