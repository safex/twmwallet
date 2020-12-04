import React from 'react';

import Loader from 'react-loader-spinner'

import { Carousel, CarouselItem } from 'react-bootstrap'

// Icon Imports

import './ComponentCSS/HomeCarousel.css'

export default function HomeCarousel(props) {

    return (
        <Carousel pause="hover" className="home-carousel">
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={require("./../../img/camera.jpg")}
                    alt="First slide"
                />

            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={require("./../../img/headphones.jpg")}
                    alt="Third slide"
                />

            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={require("./../../img/watch.jpg")}
                    alt="Third slide"
                />

            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={require("./../../img/bike.jpg")}
                    alt="Fourth slide"
                />
            </Carousel.Item>
        </Carousel>
    )
}