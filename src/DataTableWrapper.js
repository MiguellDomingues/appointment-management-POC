import { useState, cloneElement, useMemo, useCallback } from "react"
import DataTable from 'react-data-table-component';
import ModalWrapper from './ModalWrapper'

const FORM_STATES = Object.freeze({
    NEW: "NEW",
    EDIT: "EDIT"
})

function DataTableWrapper({
    data = [],
    columns = {},
    FormCmp,
    title = "",
    newObj,
    onDeleteById = null,
    onEdit = null,
    onAdd = null,
    onQueryById = null,
}){

    console.log("DataTableWrapper rendering")

    const [selectedRowId, setSelectedRowId] = useState(false);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [formState, setFormState] = useState(false)

    const getFormProps = useCallback( (formState,selectedRowId) =>{

        switch(formState){
            case FORM_STATES.NEW:
                return {
                    title:`Add ${title}`,
                    data:{...newObj},
                    submitCallback: (data)=>{
                        console.log(data)
                        onAdd(data)
                        setFormState(false)
                    },                              
            }
            case FORM_STATES.EDIT:
                return {
                    title:`Edit ${title}`,
                    data:{...onQueryById(selectedRowId)},
                    submitCallback: (data)=>{
                        console.log(data)
                        onEdit(data)
                        setFormState(false)
                    }   
            }
            default: return {}               
        }
    }, []);

    const handleRowSelected = useCallback(state => {
        setSelectedRowId(state.selectedRows[0] ? state.selectedRows[0].id : false);
    }, []);

    const handleDelete = useCallback(selectedRowId => {
        setToggleCleared(toggleCleared=>!toggleCleared);
        setSelectedRowId(false);
        onDeleteById(selectedRowId)
    }, []);

    const handleEdit = useCallback( () => setFormState(FORM_STATES.EDIT), []);

    const handleAdd = useCallback( () => setFormState(FORM_STATES.NEW), []);

    const handleCloseForm = useCallback( () => setFormState(false), []);

    const contextActions = useMemo(() => {   

        const DeleteBtn = onDeleteById ?        <button onClick={e=>handleDelete(selectedRowId)}>Delete</button> : <></>
        const EditBtn = onQueryById && onEdit ? <button onClick={handleEdit}>Edit</button> : <></>
        
      return <>{ DeleteBtn }{ EditBtn }</>
    }, [selectedRowId]);

    const actions = useMemo(() => {
        const AddBtn = newObj && onAdd ? <button onClick={handleAdd}>Add</button> : <></>
        return <>{ AddBtn }</>
    }, []);

    return (<>
        <ModalWrapper isOpen={!!formState} close={handleCloseForm}>
            {cloneElement(FormCmp,{formState, ...getFormProps(formState,selectedRowId)})} 
        </ModalWrapper> 
   
        <DataTable
            fixedHeader
            selectableRows
            selectableRowsSingle
            selectableRowsHighlight
            dense 
            actions={actions}
            title={title} 
            columns={columns} 
            data={data} 
            contextActions={contextActions} 
            onSelectedRowsChange={handleRowSelected} 
            clearSelectedRows={toggleCleared}/>
        </>);
}

export default DataTableWrapper;