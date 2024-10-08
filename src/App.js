import React, { useEffect, useState } from 'react';
import { Chart} from 'react-google-charts';

function App() {

  const [tipoDespacho, setTipoDespacho] = useState('FiFo');
  const [procesos, setProcesos] = useState([
    { proceso: 'p1', tiempoInicio: 0, tiempoEjecucion: 1, tiempoEspera: 1, tiempoSistema: 1,prioridad: 0 }
  ]);

  //--------------------------------------------------------------------------------

  useEffect(() => {
    calcularTiempos();
    //eslint-disable-next-line
  }, [tipoDespacho]);

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
      
      const parseNumber = (value) => parseInt(value, 10) || 0;
      
      updatedProcesos[0] = {
        ...updatedProcesos[0],
        tiempoEspera: 0,
        tiempoSistema: parseNumber(updatedProcesos[0].tiempoEjecucion),
      };
      
      let tiempoFinAnterior = parseNumber(updatedProcesos[0].tiempoEjecucion);
      
      for (let i = 1; i < updatedProcesos.length; i++) {
        // const tiempoEjecucionAnterior = parseNumber(updatedProcesos[i-1 >= 0 ? i-1 : 0].tiempoEjecucion);
        // const tiempoEsperaAnterior = parseNumber(updatedProcesos[i-1 >= 0 ? i-1 : 0].tiempoEspera);

        const tiempoInicioActual = parseNumber(updatedProcesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(updatedProcesos[i].tiempoEjecucion);
        
        const tiempoEspera = tiempoInicioActual >= tiempoFinAnterior ? 0 : tiempoFinAnterior - tiempoInicioActual;
        
        const tiempoSistema = tiempoEspera + tiempoEjecucionActual ;
        
        updatedProcesos[i] = {
          ...updatedProcesos[i],
          tiempoEspera: tiempoEspera,
          tiempoSistema: tiempoSistema,
        };
        
        tiempoFinAnterior = tiempoInicioActual + tiempoSistema;
      }
      
      setProcesos(updatedProcesos);
    }

    else if (tipoDespacho === 'SJF' && procesos.length > 0) {
     
      const updatedProcesos = [...procesos];

      const SJFprocesos = ordenarProcesosSFJ(updatedProcesos);
      
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

        const tiempoInicioActual = parseNumber(SJFprocesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(SJFprocesos[i].tiempoEjecucion);

        const tiempoEspera = tiempoInicioActual >= tiempoFinAnterior ? 0 : tiempoFinAnterior - tiempoInicioActual;
        
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

        const tiempoInicioActual = parseNumber(prioridadProcesos[i].tiempoInicio);
        const tiempoEjecucionActual = parseNumber(prioridadProcesos[i].tiempoEjecucion);

        const tiempoEspera = tiempoInicioActual >= tiempoFinAnterior ? 0 : tiempoFinAnterior - tiempoInicioActual;
        
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
  
    let newProcesos = Array.from({ length: newLength }, (_, index) => ({
      proceso: `p${index + 1}`,
      tiempoInicio: '',
      tiempoEjecucion: '',
      tiempoEspera: '',
      tiempoSistema: '',
    }));
  
    setProcesos(newProcesos);
  };
  

  //--------------------------------------------------------------------------------

  const validarCampos = () => {
    let valid = true;
    procesos.forEach((proceso) => {
      if (proceso.tiempoInicio === null || proceso.tiempoInicio === '' || proceso.tiempoEjecucion === null || proceso.tiempoEjecucion === '') {
        valid = false;
      }
    });
    if (!valid) {
      alert('Por favor, llene todos los campos');
    }
  }

  //--------------------------------------------------------------------------------
  
  return (
    <div className="App" style={{ width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      
      <div className='Titulo' style={{ width: '90%', height: '6ch', borderRadius: '3ch', marginTop: '1ch', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5ch' ,letterSpacing:'.1vw'}}>Algoritmos de Despacho</h1>
      </div>

      <div className='seleccionDeOPciones' style={{ display: 'flex', alignItems: 'left', flexDirection: 'column', justifyContent: 'left',width:'80%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', height: '6ch', width: '100%' }}>
          <div style={{width:'20ch'}}>
            <h5 style={{fontWeight:'400'}}>Algoritmos de Despacho</h5>
          </div>
          <select
            value={tipoDespacho}
            onChange={(e) => {setTipoDespacho(e.target.value);setProcesos([{ proceso: 'p1', tiempoInicio: 0, tiempoEjecucion: 1, tiempoEspera: 1, tiempoSistema: 1,prioridad: 0 }]);}}
            style={{ marginTop: '.8ch', marginLeft: '1ch', borderRadius: '1ch', width: '12ch', display: 'flex', textAlign: 'center' }}
          >
            <option value="FiFo">FiFo</option>
            <option value="SJF">SJF</option>
            <option value="Prioridad">Prioridad</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '6ch', width: '100%' }}>
          <div style={{width:'20ch'}}>
            <h5 style={{fontWeight:'400'}}>Número de Procesos</h5>
          </div>
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

      <div className="tabla" style={{ width: '80%', background: 'white', borderRadius: '1ch', display: 'flex', flexDirection: 'column', padding: '3ch' ,boxShadow: '0 0 1ch rgba(0, 0, 0, 0.2)'}}>
        <h2>Tabla de Procesos</h2>
        <table style={{ width: '100%', marginTop: '1ch', borderCollapse: 'collapse', marginBottom: '2ch' }}>
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
          <tbody >
            {procesos.map((proceso, index) => (
              <tr key={index}>
                <td style={{background:'white'}}>
                  <input
                    type="text"
                    value={`${proceso.proceso}`}
                    onChange={(e) => handleProcesoChange(index, 'proceso', e.target.value)}
                    style={{ width: '95%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#523772', outline: 'none', boxShadow: 'none',color:'white',fontWeight:'600' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={proceso.tiempoInicio}
                    onInput={(e) => {
                      // Elimina cualquier carácter que no sea un número o un punto decimal
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    min={0}
                    placeholder="entre un numero en segundos"
                    onChange={(e) => handleProcesoChange(index, 'tiempoInicio', e.target.value)}
                    style={{ width: '100%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#fff9da', outline: 'none', boxShadow: 'none' }}
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
                    onInput={(e) => {
                      // Elimina cualquier carácter que no sea un número o un punto decimal
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    min={0}
                    placeholder="entre un numero en segundos"
                    onChange={(e) => handleProcesoChange(index, 'tiempoEjecucion', e.target.value)}
                    style={{ width: '100%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none', background: '#fff9da' }}
                  />
                </td>
                {
                  tipoDespacho === 'Prioridad' && (
                    <td>
                      <input
                        type="number"
                        value={proceso.prioridad}
                        min={0}
                        onInput={(e) => {
                          // Elimina cualquier carácter que no sea un número o un punto decimal
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                        placeholder="entre un numero"
                        onChange={(e) => handleProcesoChange(index, 'prioridad', e.target.value)}
                        style={{ width: '100%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none', background: '#fff9da' }}
                      />
                    </td>
                  )
                }
                <td>
                  <input
                    type="number"
                    placeholder="click en calcular"
                    value={proceso.tiempoEspera}
                    style={{ width: '100%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none' , background: '#fff9da'}}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={proceso.tiempoSistema}
                    placeholder="click en calcular"
                    style={{ width: '100%', height: '4ch', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', outline: 'none', boxShadow: 'none', background: '#fff9da' }}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className='calcular' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1ch', margin:'2ch'}}>
        <button
          onClick={()=> {calcularTiempos();validarCampos()}}
          style={{ width: '10ch', borderRadius: '.5ch', background: '#2684ff',color:'white', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', fontWeight: '100', fontSize: '2ch', padding: '.5ch', cursor: 'pointer' ,boxShadow: '0 0 1ch rgba(0, 0, 0, 0.2)'}}
        >
          Calcular
        </button>
      </div>
                      
      <div className='diagramaDegantt' style={{width:'80%',marginBottom:'5ch',borderRadius:'2ch',background:'white',height:'35ch',padding:'3ch',boxShadow: '0 0 1ch rgba(0, 0, 0, 0.2)'}}>
        <h2>Diagrama de Gantt</h2>               
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
              console.log(proceso);
              return [
                `${proceso.proceso}`,
                `${proceso.proceso}`, 
                '',
                new Date(2021, 1, 1, 0, 0, parseInt(proceso.tiempoInicio) + parseInt(proceso.tiempoEspera)),
                new Date(2021, 1, 1, 0, 0, parseInt(proceso.tiempoInicio) + parseInt(proceso.tiempoEspera) + parseInt(proceso.tiempoEjecucion)),
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
            },
          }}
        />
      </div>

    </div>
  );
}

export default App;
