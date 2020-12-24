import React from 'react';

import Loader from 'react-loader-spinner'

import ReactModal from 'react-modal';

import { Row, Col, Form, Modal, Image } from 'react-bootstrap'

// Icon Imports
import { AiOutlineInfoCircle } from 'react-icons/ai'
import {IconContext} from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import ReactTooltip from 'react-tooltip'

import './ComponentCSS/MerchantAccounts.css'

export default function MerchantAccounts(props) {

    return (
        <div>
        {props.accounts.length > 0 ?
            <Row className="merchant-accounts-box">

                <h1>Accounts</h1>

                <Col md={7} className="account-list d-flex no-gutters p-3">

                    {props.accounts}

                </Col>

                {props.selected !== void (0) ? 
                    <Col md={3}
                            className="
                        no-gutters d-flex flex-column 
                        align-items-center justify-content-center b-r10 
                        merchant-profile-view text-align-center"
                    >
                        <Row>
                            <ul>
                                <li>
                                    <Image
                                        className="border border-white grey-back"
                                        width={100}
                                        height={100}
                                        src={props.data.avatar}
                                        roundedCircle
                                    />
                                </li>
                                <h2>{props.selected.username}</h2>

                            </ul>
                        </Row>

                        <div id="account-edit-buttons" className=" d-flex flex-column">
                            <button className="merchant-mini-buttons" 
                                    onClick={() => props.handleEditAccountForm(props.selected)}>
                                Edit
                            </button>

                            <button className="merchant-mini-buttons" onClick={() => props.registerApi(props.selected)}>
                                Register API
                            </button>

                            <button className="merchant-mini-buttons">
                                Remove
                            </button>
                        </div>
                    </Col>
                :
                    ''
                }
            </Row>

        :
            
            <Row className="merchant-accounts-box">
                <Col className="new-account-box" md={4}>
                    <Image
                        width={150}
                        height={150}
                        src={props.newAccountImage}
                        roundedCircle
                    />

                    <h3>Safex Seller</h3>

                    <button onClick={props.handleNewAccountForm}>
                        New Account
                    </button>

                    
                </Col>
            </Row>
        }
            <ReactModal
            closeTimeoutMS={500}
            isOpen={props.showNewAccountForm}
            onRequestClose={props.handleNewAccountForm}
            className="new-account-modal"

            style={{
                overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
                },
                content: {
                position: 'absolute',
                top: '40px',
                left: '40px',
                right: '40px',
                bottom: '40px',
                overflow: 'auto',
                }
            }}
        >
            
            <h1>Make New Account</h1>
    
            <Form id="create_account" onSubmit={props.registerAccount}>
                <Row className="no-gutters justify-content-between w-100">
                    <Col md="8">
                        <Form.Group as={Col}>
                            <Form.Label>Username</Form.Label>

                            <Form.Control name="username"
                                            placedholder="enter your desired username"/>
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Label>Avatar URL</Form.Label>
                            <Form.Control
                                onChange={props.handleChange}
                                value={props.newAccountImage}
                                name="new_account_image"
                                placedholder="Enter the URL of your avatar"
                            />
                        </Form.Group>
                    </Col>

                    <Col md="4">
                        <Image
                            width={125}
                            height={125}
                            src={props.newAccountImage}
                            roundedCircle
                        />
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Group as={Col}>
                            <Form.Label>Biography</Form.Label>
                            <Form.Control
                                maxLength="500"
                                as="textarea"
                                name="biography"
                                placedholder="type up your biography"
                                style={{maxHeight: 150}}
                            />
                        </Form.Group>


                        <Form.Group as={Col}>
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                name="location"
                                defaultValue="Earth"
                                placedholder="your location"
                            />
                        </Form.Group>

                        <Form.Group as={Col}>

                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                name="email"
                                defaultValue="xyz@example.com"
                                placedholder="your location"
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Group md="6" as={Col}>
                                <Form.Label>Twitter Link</Form.Label>
                                <Form.Control
                                    name="twitter"
                                    defaultValue="twitter.com"
                                    placedholder="enter the link to your twitter handle"
                                />

                            </Form.Group>

                            <Form.Group md="6" as={Col}>
                                <Form.Label>Facebook Link</Form.Label>
                                <Form.Control
                                    name="facebook"
                                    defaultValue="facebook.com"
                                    placedholder="enter the to of your facebook page"
                                />

                            </Form.Group>

                            <Form.Group md="6" as={Col}>
                                <Form.Label>LinkedIn Link</Form.Label>
                                <Form.Control
                                    name="linkedin"
                                    defaultValue="linkedin.com"
                                    placedholder="enter the link to your linkedin handle"
                                />
                            </Form.Group>

                            <Form.Group md="6" as={Col}>

                                <Form.Label>Website</Form.Label>
                                <Form.Control
                                    name="website"
                                    defaultValue="safex.org"
                                    placedholder="if you have your own website: paste your link here"
                                />
                            </Form.Group>

                        </Form.Group>


                        <Form.Group as={Col}>

                            <Form.Label>Mixins</Form.Label>
                            <IconContext.Provider
                                value={{color: 'white', size: '20px'}}>
                                <AiOutlineInfoCircle data-tip data-for='apiInfo'
                                                className="blockchain-icon mx-4 white-text"/>

                                <ReactTooltip id='apiInfo' type='info'
                                                effect='solid'>
                                    <span>
                                        Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                        They are combined with yours for private transactions.<br/>
                                        Changing props from the default could hurt your privacy.<br/>
                                    </span>
                                </ReactTooltip>
                            </IconContext.Provider>


                            <Form.Control
                                name="mixins"
                                as="select"
                                defaultValue="7"
                            >
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                            </Form.Control>

                        </Form.Group>
                    </Col>


                </Row>

                <button
                    block
                    size="lg"
                    variant="success"
                    type="submit"
                    className="my-5"
                >

                    Create Account
                </button>
                
                <button className="close-button"
                        onClick={() => props.handleNewAccountForm}>
                    Close
                </button>
            </Form>

            
        </ReactModal>

        {props.selected ? 
            <ReactModal
                closeTimeoutMS={500}
                isOpen={props.showEditAccountForm}
                onRequestClose={props.handleEditAccountForm}
                className="new-account-modal"

                style={{
                    overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)'
                    },
                    content: {
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    right: '40px',
                    bottom: '40px',
                    overflow: 'auto',
                    }
                }}
            >

                <h1>Edit Account {props.selected.username}</h1>

                    <Form id="edit_account"
                            onSubmit={(e) => props.edit_account_top(e)}>
                        <Form.Row>
                            <Col md="8">
                                <Form.Group as={Col}>
                                    <Form.Label>Username</Form.Label>

                                    <Form.Control name="username"
                                                    defaultValue={props.selected.username}/>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Label>Avatar URL</Form.Label>

                                    <Form.Control name="avatar"
                                                    defaultValue={props.data.avatar}/>
                                </Form.Group>
                            </Col>

                            <Col md="4">
                                <Image
                                    className="border border-white grey-back"
                                    width={150}
                                    height={150}
                                    src={props.data.avatar}
                                    roundedCircle
                                />
                            </Col>
                        </Form.Row>

                        <Form.Row>
                            <Col>
                                <Form.Group as={Col}>
                                    <Form.Label>Biography</Form.Label>

                                    <Form.Control maxLength="500"
                                                    as="textarea"
                                                    name="biography"
                                                    defaulValue={props.data.biography ? props.data.biography : ''}/>
                                </Form.Group>


                                <Form.Group as={Col}>
                                    <Form.Label>Location</Form.Label>

                                    <Form.Control name="location"
                                                    defaultValue={props.data.location ? props.data.location : ''}/>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Label>Email</Form.Label>

                                    <Form.Control name="email"
                                                    defaultValue={props.data.email ? props.data.email : ''}/>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Group md="6" as={Col}>
                                        <Form.Label>Twitter
                                            Link</Form.Label>

                                        <Form.Control name="twitter"
                                                        defaultValue={props.data.twitter ? props.data.twitter : ''}/>
                                    </Form.Group>

                                    <Form.Group md="6" as={Col}>
                                        <Form.Label>Facebook
                                            Link</Form.Label>

                                        <Form.Control name="facebook"
                                                        defaultValue={props.data.facebook ? props.data.facebook : ''}/>
                                    </Form.Group>

                                    <Form.Group md="6" as={Col}>
                                        <Form.Label>LinkedIn
                                            Link</Form.Label>

                                        <Form.Control name="linkedin"
                                                        defaultValue={props.data.linkedin ? props.data.linkedin : ''}/>
                                    </Form.Group>

                                    <Form.Group md="6" as={Col}>

                                        <Form.Label>Website</Form.Label>
                                        <Form.Control name="website"
                                                        defaultValue={props.data.website ? props.data.website : ''}/>
                                    </Form.Group>

                                </Form.Group>


                                <Form.Group as={Col}>

                                    <Form.Label>Mixins</Form.Label>
                                    <IconContext.Provider value={{
                                        color: 'white',
                                        size: '20px'
                                    }}>
                                        <AiOutlineInfoCircle data-tip
                                                        data-for='apiInfo'
                                                        className="blockchain-icon mx-4 white-text"/>

                                        <ReactTooltip id='apiInfo'
                                                        type='info'
                                                        effect='solid'>
                                            <span>
                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                They are combined with yours for private transactions.<br/>
                                                Changing this from the default could hurt your privacy.<br/>
                                            </span>
                                        </ReactTooltip>
                                    </IconContext.Provider>


                                    <Form.Control
                                        name="mixins"
                                        as="select"
                                        defaultValue="7"
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                        <option>6</option>
                                        <option>7</option>
                                    </Form.Control>

                                </Form.Group>
                            </Col>


                        </Form.Row>

                        <button block size="lg" type="submit"
                                variant="success">
                            Submit Edit
                        </button>
                    </Form>
                    
                    <button className="close-button my-3"
                            onClick={props.handleEditAccountForm}>
                        Close
                    </button>
                    
            </ReactModal>
        :
            ''
        }
        </div>
    )
}