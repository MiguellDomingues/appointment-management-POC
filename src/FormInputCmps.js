
import { useState, useMemo, useCallback } from "react"

import React from "react"

import { useForm } from 'react-hook-form'

import _  from 'lodash';

export function Form({data, submitCallback, formState, newObj, children}){

    const { 
        register, 
        handleSubmit, 
        reset,
        getValues,
    } = useForm({defaultValues: data})

    const onClear = useCallback( (data) =>{
        //const emptyKeys = {name: "", employees: []} 
        const emptyKeys = {...newObj}  
        
        if(data?.id) emptyKeys.id = data.id

        reset(emptyKeys)
    }, [])

    //console.log("children: ", children)

    const appendFormInputProps = useCallback( (children) =>

        React.Children.map(children, (child) => {

            if(child.props?.children){
                return React.createElement(child.type, {...{...child.props}}, appendFormInputProps(child.props.children))
            }
            
            if(child.props?.name){

                if(child.type.name === "Input" || child.type.name === "Select"){
                    return React.createElement(child.type, {...{...child.props, register: register, key: child.props.name}}) 
                }else{
                    return React.createElement(
                        child.type, 
                        {...
                            {...child.props, 
                            dataArr: [...getValues()[child.props.name]],
                            onUpdate : (updatedData)=>reset({...getValues(), [child.props.name]: updatedData}),
                            key: child.props.name
                    }})
                }

                //if(child.type.name === "Input") console.log("im an Input cmp!")
                // if(child.type.name === "Select") console.log("im an Select cmp!")
                // if(child.type.name === "PillList") console.log("im a PillList cmp!")
                //console.log(child.type.name === "Input" ? "im an Input cmp!" : "Im a Select cmp!")
                //return React.createElement(child.type, {...{...child.props, register: register, key: child.props.name}})
            }
            
            return child
    }), [])

//const memoizedForm = useMemo(()=>appendFormInputProps(children), [])

//{appendFormInputProps(children)}
// {memoizedForm}

return (
    <form onSubmit={handleSubmit(submitCallback)}>
        {/*React.Children.map(children, (child) => {

        
        console.log("-----child:------- ", child)

        if(child.props?.children){
            console.log("i have children: ", child.props?.children)
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

        })*/}
        {appendFormInputProps(children)}
        
        <input type="submit" value="Submit" />
        <input type="button" onClick={() => reset(data)} value="reset"/>
        <input type="button" onClick={() => onClear(data)} value="clear all"/>
    </form>)
}

export function Input({ register, name,...rest }) {
    //console.log("INPUT: ", register, name)
    //if(!register) return <></>
    return <><input {...register(name)} {...rest} /></>
}
  
export function Select({ register, options, name, ...rest }) {
    return (
      <select {...register(name)} {...rest}>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    )
}

export function PillList({
    dataArr = [], 
    onUpdate = ()=>{}, 
    pillSource = [],
    onPillRender = (p)=><>{p}</>,
    title = ""
}){

    console.log("rendering PillList")

   // useEffect(()=>setShowNew(false),[dataArr])

    const [showNew, setShowNew] = useState(false)

    const addablePills = useMemo(()=>_.difference(pillSource,dataArr), [dataArr, pillSource])
    const addPillButtonDisabled = addablePills.length === 0 

  //  console.log("addablePills",addablePills)
  //  console.log("pillSource",pillSource)
  //  console.log("dataArr",dataArr)

    const handleDelete = useCallback( (e, id, dataArr) =>{
        e.preventDefault()
        //const filtered = dataArr.filter(data=>data !== id)
       onUpdate(dataArr.filter(data=>data !== id))
    } , [])

    const toggleShowDropdown = useCallback( (e) => {
        e.preventDefault()
        setShowNew((showNew)=>!showNew)
    }, [])

    const handleAdd = useCallback( (e,dataArr) => { 
        e.target.value && onUpdate([...dataArr, e.target.value]) 
        setShowNew(false)
    }, [])

    return(<>
        {title} 
        {showNew ? 
            <button onClick={toggleShowDropdown}>-</button> : 
            <button disabled={addPillButtonDisabled} onClick={toggleShowDropdown}>+</button> 
        } 

        <div className="pill_list_container">
        
            {dataArr.map((id,idx)=>
                <span className="pill_container" key={idx}>
                    {onPillRender(id)}{"  "}
                    <span className="pill_container_close_btn" onClick={e=>handleDelete(e, id, dataArr)}>
                        X
                    </span>
                </span>)}

                {showNew ? 
                    <span className="pill_container" >
                        <select onChange={e=>handleAdd(e, dataArr)}>
                            <option value={""}>{""}</option>
                            {addablePills.map((p,idx)=>
                                <option key={idx} value={p}>
                                    {onPillRender(p)}
                                </option>)}
                        </select>                
                    </span>              
                : <></>}
        </div>


    </>)
}

