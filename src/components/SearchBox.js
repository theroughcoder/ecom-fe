import React, { useState } from 'react'
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
    const navigate = useNavigate();
    const [query, setQuery] = useState(' ');
    const submitHandler = (e)=>{
        e.preventDefault();
        navigate( query? `/search/?query=${query}` : '/search')
    }
  return (
    <Form className='blinkit-search-form d-flex me-auto' onSubmit={submitHandler}>
        <InputGroup>
            <FormControl type="text"
            name="q"
            id='q'
            onChange={(e)=>{setQuery(e.target.value)}}
            placeholder="Search for products..."
            aria-label="Search Products">
            </FormControl>
            <Button type='submit'>
              <i className="fas fa-search" />
            </Button>
        </InputGroup>
    </Form>
  )
}
