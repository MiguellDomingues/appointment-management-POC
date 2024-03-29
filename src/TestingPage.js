
import { useState, useMemo, useRef,cloneElement, useCallback } from "react"

import React from "react"

import { useForm } from 'react-hook-form'

import _  from 'lodash';

import useBoundStore from "./store";
import DataTableWrapper from './DataTableWrapper'


import {
    EmployeeForm, 
    ShiftForm,
    BreakForm,
    WorkDayForm
} from './Forms'

function useEmployees(){

    const {
        employees,
        deleteEmployee,
        patchEmployee,
        addEmployee,
        getEmployeeById
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    const employeeColumns = [
        {
            name: 'Id',
            center: true,
            selector: row => row.id,
            
        },
        {
            name: 'Name',
            center: true,
            selector: row => row.name,
            
        },
    ];

    const props = {
        data : employees,
        columns : employeeColumns,
        FormCmp : <EmployeeForm/>,
        title : "Employees",
        newObj : {name: ""},
        onDeleteById : deleteEmployee,
        onEdit : patchEmployee,
        onAdd : addEmployee,
        onQueryById : getEmployeeById,        
    }

    return {...props}

}

function useShifts(){

    const {
        shifts,
        addShift,
        patchShift,
        removeShift,
        getShiftById,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    const shiftColumns = [
        {
            name: 'Id',
            selector: row => row.id,
        },
        {
            name: 'Desc',
            selector: row => row.desc,
        },
        {
            name: 'Start',
            selector: row => row.start,
        },
        {
            name: 'End',
            selector: row => row.end,
        },
        {
            name: 'Employees',
            selector: row => row.employees.map(e_id=>getEmployeeById(e_id).name).join(","),
        },
    ];

    return {
        data : shifts,
        columns : shiftColumns,
        FormCmp : <ShiftForm/>,
        title : "Shifts",
        newObj : {start: "", end: "", employees: [], desc: ""},
        onDeleteById : removeShift,
        onEdit : patchShift,
        onAdd : addShift,
        onQueryById : getShiftById,        
    }
}

function useBreaks(){

    const {
        breaks,
        addBreak,
        patchBreak,
        removeBreak,
        getBreakById,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    const breakColumns = [
        {
            name: 'Id',
            selector: row => row.id,
        },
        {
            name: 'Desc',
            selector: row => row.desc,
        },
        {
            name: 'Start',
            selector: row => row.start,
        },
        {
            name: 'End',
            selector: row => row.end,
        },
        {
            name: 'Employees',
            selector: row => row.employees.map(e_id=>getEmployeeById(e_id).name).join(","),
        },
    ];

    return {
        data : breaks,
        columns : breakColumns,
        FormCmp : <BreakForm/>,
        title : "Breaks",
        newObj : {start: "", end: "", employees: [], desc: ""},
        onDeleteById : removeBreak,
        onEdit : patchBreak,
        onAdd : addBreak,
        onQueryById : getBreakById,        
    }
}

function useWorkDays(){

    const {
        workDays,
        addWorkDay,
        patchWorkDay,
        removeWorkDay,
        getWorkDayById,
        getWorkDaySchema,
        getShiftById,
        getBreakById, 
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    const workDayColumns = [
        {
            name: 'Id',
            selector: row => row.id,
        },
        {
            name: 'open',
            selector: row => row.open,
        },
        {
            name: 'close',
            selector: row => row.close,
        },
        {
            name: 'dotw',
            selector: row => row.dotw,
        },
        {
            name: 'shifts',
            selector: row => row.shifts.map(id=>getShiftById(id).desc).join(","), //row.shifts.join(","),
        },
        {
            name: 'breaks',
            selector: row => row.breaks.join(","),
        },
    ];

    return {
        data : workDays,
        columns : workDayColumns,
        FormCmp : <WorkDayForm/>,
        title : "Work Days",
        newObj : {open: "", close: "", dotw: "", shifts: [], breaks: []},
        onDeleteById : removeWorkDay,
        onEdit : patchWorkDay,
        onAdd : addWorkDay,
        onQueryById : getWorkDayById,        
    }
}

function TestingPage(){

    const employeeProps = useEmployees()
    const shiftProps = useShifts()
    const breakProps = useBreaks()
    const workDayProps = useWorkDays()


    return (<>
        <div>
           <DataTableWrapper {...shiftProps} />
        </div>
        <div>
            <DataTableWrapper {...employeeProps} /> 
        </div>
        <div>
            <DataTableWrapper {...breakProps} />
        </div>
        <div>        
            {<DataTableWrapper {...workDayProps} />}
        </div>
    </> )
}



 
/*
 <Input name="lastName" type="number"/>
 <Select name="gender" options={["female", "male", "other"]} />


*/



/*
 function test(children){

        const a = React.Children.map(children, (child) => {

            
            console.log("-----child:------- ", child)

            if(child.props?.children){
                console.log("************i have children: *****************", child.props?.children)
               return React.createElement(child.type, {...{...child.props},}, test(child.props.children))

            }

            if(child.props?.name){

                console.log("create w/ name")
                console.log("child.props.name: ", child.props.name)
                console.log("child.type: ", child.type)


                return  React.createElement(
                    child.type, 
                {
                  ...{
                    ...child.props,
                    register: register,//methods.register,
                    key: child.props.name,
                  },
                })
            }else
                return child

        })

        console.log("results of react.children.map: ", a)

        return a

    }
*/

  /*

() => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [toggleCleared, setToggleCleared] = React.useState(false);
  const [data, setData] = React.useState(tableDataItems);
  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);
  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map(r => r.title)}?`)) {
        setToggleCleared(!toggleCleared);
        setData(differenceBy(data, selectedRows, 'title'));
      }
    };
    return <Button key="delete" onClick={handleDelete} style={{
      backgroundColor: 'red'
    }} icon>
                Delete
            </Button>;
  }, [data, selectedRows, toggleCleared]);
  return <DataTable title="Desserts" columns={columns} data={data} selectableRows contextActions={contextActions} onSelectedRowsChange={handleRowSelected} clearSelectedRows={toggleCleared} pagination />;
}

*/

  export default TestingPage;