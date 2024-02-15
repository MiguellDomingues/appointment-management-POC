import useBoundStore from "./store";

import {
    Form, 
    Input,
    Select,
    PillList
} from './FormInputCmps'

export function EmployeeForm({title, ...rest}) {

    console.log("new form wrapper rendering: employees")

    return (<>
        <div className="modal_form_body">
            {title}   
            <Form {...rest}>
              
                <div>
                    Name<br/>
                    <Input name="name" type="text"/>                             
                </div>

            </Form>
        </div> 
    </>)
}

export function ShiftForm({title, ...rest}) {

    console.log("new form wrapper rendering: shifts")

    const { 
        employees,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) 

    return (<>
        <div className="modal_form_body">
            {title}   
            <Form {...rest}>
              
                <div>
                    Description<br/>
                    <Input name="desc" type="text"/>                              
                </div>

                <div>
                    Start Time<br/>
                    <Input name="start" type="time"/>                             
                </div>

                <div> 
                    End Time<br/>
                    <Input name="end" type="time"/>                                
                </div>

                <div>
                    <PillList 
                        name="employees"
                        title={"Employees"}
                        pillSource={employees.map(e=>e.id)}
                        onPillRender={id=><>{getEmployeeById(id).name}</>}/>                    
                </div>

            </Form>
        </div> 
    </>)
}

export function BreakForm({title, ...rest}) {

    console.log("new form wrapper rendering: breaks")

    const { 
        employees,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) 

    return (<>
        <div className="modal_form_body">
            {title}   
            <Form {...rest}>
              
                <div>
                    Description<br/>
                    <Input name="desc" type="text"/>                              
                </div>

                <div>
                    Start Time<br/>
                    <Input name="start" type="time"/>                             
                </div>

                <div> 
                    End Time<br/>
                    <Input name="end" type="time"/>                                
                </div>

                <div>
                    Employees<br/>
                    <PillList 
                        name="employees"
                        pillSource={employees.map(e=>e.id)}
                        onPillRender={id=><>{getEmployeeById(id).name}</>}/>                    
                </div>

            </Form>
        </div> 
    </>)
}

export function WorkDayForm({title, formState, data, ...rest}) {

    console.log("new form wrapper rendering: workdays")

    const { 
        breaks,
        shifts,
        getShiftById,
        getBreakById, 
        getMissingWorkDays,
    } = useBoundStore((state) => ({...state})) 

    return (<>
        <div className="modal_form_body">
            {title}   
            <Form data={data} {...rest}>
              
                 <div>
                    DOTW<br/>
                    {formState === "NEW" ? 
                        <Select name="dotw" options={getMissingWorkDays()} /> : 
                    <>{data.dotw}</>}
                </div>

                <div>
                    Open Time<br/>
                    <Input name="open" type="time"/>                             
                </div>

                <div> 
                    Close Time<br/>
                    <Input name="close" type="time"/>                                
                </div>

                <div>
                    <PillList 
                        name="shifts"
                        title={"Shifts"}
                        pillSource={shifts.map(e=>e.id)}
                        onPillRender={id=><>{getShiftById(id).desc}</>}/>                    
                </div>

                <div>
                    <PillList 
                        name="breaks"
                        title={"Breaks"}
                        pillSource={breaks.map(e=>e.id)}
                        onPillRender={id=><>{getBreakById(id).desc}</>}/>                    
                </div>

            </Form>
        </div> 
    </>)
}













/*

PRE-REFACTOR FORMS


export function EmployeeForm({
    data = {}, 
    submitCallback = ()=>{}, 
    title = ""
}){

    const { 
        register, 
        handleSubmit, 
        reset,
        getValues
    } = useForm({defaultValues: data})

    console.log("data///", data)
    console.log("getValues///", getValues())

   // console.log("///",_.isEqual(getValues(),data))

    const onClear = (data) =>{
        const emptyKeys = {
            name: ""
        }   
        
        if(data?.id) emptyKeys.id = data.id

        reset(emptyKeys)
    }

    return(<>
        <div className="modal_form_body">
            {title}

            <form onSubmit={handleSubmit(submitCallback)}>

                <div>
                    Name<br/>
                    <input type="text" {...register("name")}/>                             
                </div>

                <input type="submit" value="confirm"/>
                <input type="button" onClick={() => reset(data)} value="reset"/>
                <input type="button" onClick={() => onClear(data)} value="clear all"/>
            </form>
            
        </div>  
    </>)
}

export function ShiftForm({
    data = {}, 
    submitCallback = ()=>{}, 
    title = ""
}){

    const { 
        employees,
        getEmployeeById 
    } = useBoundStore((state) => ({...state})) 


    const { 
        register, 
        handleSubmit, 
        reset,
        getValues
    } = useForm({defaultValues: data})

    console.log("data///", data)
    console.log("getValues///", getValues())

   // console.log("///",_.isEqual(getValues(),data))



    const onClear = (data) =>{

        console.log("onClear: ", data)

        const emptyKeys = {
            start: "",
            end: "",
            employees: [],
            desc: ""
        }

        if(data?.id) emptyKeys.id = data.id
        
        reset(emptyKeys)
    }

    return(<>
        <div className="modal_form_body">
            {title}

            <form onSubmit={handleSubmit(submitCallback)}>

                <div>
                    Description<br/>
                    <input type="text" {...register("desc")}/>                             
                </div>

                <div>
                    Start Time<br/>
                    <input type="time" {...register("start")}/>                             
                </div>

                <div> 
                    End Time<br/>
                    <input type="time" {...register("end")}/>                             
                </div>

                <div>
                    Employees<br/>
                    <PillList 
                        dataArr={[...getValues().employees]}
                        onUpdate={(updatedData)=>reset({...getValues(), employees: updatedData})}
                        pillSource={employees.map(e=>e.id)}
                        onPillRender={id=><>{getEmployeeById(id).name}</>}
                    />                    
                </div>
                
                <input type="submit" value="confirm"/>
                <input type="button" onClick={() => reset(data)} value="reset"/>
                <input type="button" onClick={() => onClear(data)} value="clear all"/>
            </form>
            
        </div>  
    </>)
}

export function BreakForm({
    data = {}, 
    submitCallback = ()=>{}, 
    title = ""
}){

    const { 
        employees,
        getEmployeeById 
    } = useBoundStore((state) => ({...state})) 


    const { 
        register, 
        handleSubmit, 
        reset,
        getValues
    } = useForm({defaultValues: data})

    console.log("data///", data)
    console.log("getValues///", getValues())

   // console.log("///",_.isEqual(getValues(),data))



    const onClear = (data) =>{

        console.log("onClear: ", data)

        const emptyKeys = {
            start: "",
            end: "",
            employees: [],
            desc: ""
        }

        if(data?.id) emptyKeys.id = data.id
        
        reset(emptyKeys)
    }

    return(<>
        <div className="modal_form_body">
            {title}

            <form onSubmit={handleSubmit(submitCallback)}>

                <div>
                    Description<br/>
                    <input type="text" {...register("desc")}/>                             
                </div>

                <div>
                    Start Time<br/>
                    <input type="time" {...register("start")}/>                             
                </div>

                <div> 
                    End Time<br/>
                    <input type="time" {...register("end")}/>                             
                </div>

                <div>
                    Employees<br/>
                    <PillList 
                        dataArr={[...getValues().employees]}
                        onUpdate={(updatedData)=>reset({...getValues(), employees: updatedData})}
                        pillSource={employees.map(e=>e.id)}
                        onPillRender={id=><>{getEmployeeById(id).name}</>}
                    />                    
                </div>
                
                <input type="submit" value="confirm"/>
                <input type="button" onClick={() => reset(data)} value="reset"/>
                <input type="button" onClick={() => onClear(data)} value="clear all"/>
            </form>
            
        </div>  
    </>)
}

export function WorkDayForm({
    data = {}, 
    submitCallback = ()=>{}, 
    title = "",
    formState,
}){

    const { 
        breaks,
        shifts,
        getShiftById,
        getBreakById, 
        getMissingWorkDays,
    } = useBoundStore((state) => ({...state})) 


    const { 
        register, 
        handleSubmit, 
        reset,
        getValues
    } = useForm({defaultValues: data})

    console.log("data///", data)
    console.log("getValues///", getValues())

    console.log("formState", formState)



    const onClear = (data) =>{

        console.log("onClear: ", data)

        const emptyKeys =  {open: "", close: "", dotw: "", shifts: [], breaks: []}

        if(data?.id) emptyKeys.id = data.id
        
        reset(emptyKeys)
    }


    return(<>
        <div className="modal_form_body">
            {title}

            <form onSubmit={handleSubmit(submitCallback)}>

               {formState === "NEW" ? 
                    <select {...register("dotw")}>
                        <option value="">Select A WeekDay</option>
                        {getMissingWorkDays().map((dotw,idx)=><option key={idx} value={dotw}>{dotw}</option>)}         
                    </select> : 
                <>{getValues().dotw}</> }

                <div>
                    Open Time<br/>
                    <input type="time" {...register("open")}/>                             
                </div>

                <div> 
                    Close Time<br/>
                    <input type="time" {...register("close")}/>                             
                </div>

               

                <div>
                    <PillList 
                        title={"Breaks"}
                        dataArr={[...getValues().breaks]}
                        onUpdate={(updatedData)=>reset({...getValues(), breaks: updatedData})}
                        pillSource={breaks.map(b=>b.id)}
                        onPillRender={id=><>{getBreakById(id).desc}</>}
                    />                    
                </div>

                <div>
                    <PillList
                        title={"Shifts"}
                        dataArr={[...getValues().shifts]}
                        onUpdate={(updatedData)=>reset({...getValues(), shifts: updatedData})}
                        pillSource={shifts.map(s=>s.id)}
                        onPillRender={id=><>{getShiftById(id).desc}</>}
                    />                    
                </div>
                
                <input type="submit" value="confirm"/>
                <input type="button" onClick={() => reset(data)} value="reset"/>
                <input type="button" onClick={() => onClear(data)} value="clear all"/>
            </form>
            
        </div>  
    </>)
}
*/


/*
function PillList({
    dataArr = [], 
    onUpdate = ()=>{}, 
    pillSource = [],
    onPillRender = (p)=><>{p}</>
}){

    useEffect(()=>setShowNew(false),[dataArr])

    const addablePills = useMemo( ()=>_.difference(pillSource,dataArr), [dataArr, pillSource])

    console.log("addablePills",addablePills)
    console.log("pillSource",pillSource)
    console.log("dataArr",dataArr)

    const [showNew, setShowNew] = useState(false)

    /*
    function handleDelete(id, data){
        const filtered = data.filter(e=>e !== id)
       onUpdate(filtered)
    }
    

    function handleDelete(e, id){
        e.preventDefault()
        //const filtered = dataArr.filter(data=>data !== id)
       onUpdate(dataArr.filter(data=>data !== id))
    }


    function handleAdd(e){ e.target.value && onUpdate([...dataArr, e.target.value]) }
        
       
    return(<>
        {dataArr.map((da,idx)=>
            <span key={idx}>
                {onPillRender(da)}
                <button onClick={e=>{                
                    handleDelete(e, da)
                }}>X</button>
            </span>   
        )}
        {addablePills.length > 0 ? 
            showNew ? 
                <span>
                    <select onChange={handleAdd}>
                        <option value={""}>{""}</option>
                        {addablePills.map((p,idx)=><option key={idx} value={p}>{onPillRender(p)}</option>)}
                    </select>
                    <button onClick={()=>setShowNew(false)}>-</button>
                </span> 
            : 
            <button onClick={()=>setShowNew(true)}>+</button>         
         : <></>}
    </>)
}
*/





