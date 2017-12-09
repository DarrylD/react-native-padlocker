//@flow

import React from 'react'
import { Text, View, Animated } from 'react-native'

import { Font } from 'expo'
import { Entypo, Feather } from '@expo/vector-icons'
import styled from 'styled-components/native'
import { chunk } from 'lodash'

import PadLocker from './padlocker'

const DURATION = 10000
const VIBRATE_NOPE_PATTERN = [200, 400]

const Body = styled.View`
    height: 100%;
    padding: 20px 10px 0px 10px;
    background: #21ce99;
    flex-direction: column;
    justify-content: space-between;
`

const LogoIcon = styled(Entypo)`
    padding: 1px;
    align-self: center;
    margin-top: 40px;
    flex: 1;
`

class FadeIn extends React.Component<
    { duration: number, style?: Object },
    any
> {
    state = {
        fadeAnim: new Animated.Value(0), // Initial value for opacity: 0
    }

    componentDidMount() {
        Animated.timing(
            // Animate over time
            this.state.fadeAnim, // The animated value to drive
            {
                toValue: 1, // Animate to opacity: 1 (opaque)
                duration: this.props.duration || 1000, // Make it take a while
            }
        ).start()
    }

    render() {
        const { style, ...rest } = this.props

        return (
            <Animated.View // Special animatable View
                style={{
                    opacity: this.state.fadeAnim, // Bind opacity to animated value
                    ...style,
                }}
                {...rest}
            />
        )
    }
}

type AppState = {
    loaded: boolean,
    selected?: string,
    status: string,
    unlocked: boolean,
}

export default class App extends React.Component<{}, AppState> {
    state = {
        loaded: false,
        unlocked: false,
        selected: '',
        status: '',
    }

    async handleFontLoad() {
        try {
            await Font.loadAsync({
                roboto: require('./assets/fonts/Roboto-Light.ttf'),
                robotoMed: require('./assets/fonts/Roboto-Medium.ttf'),
                entypo: require('./node_modules/@expo/vector-icons/fonts/Entypo.ttf'),
            })

            this.setState({ loaded: true })
        } catch (error) {
            // alert('error loading font')
        }
    }

    componentDidMount() {
        this.handleFontLoad()
    }

    render() {
        let { loaded } = this.state

        if (!loaded) return null

        return (
            <PadLocker
                correctPin={1111}
                backgroundColor="#21ce99"
                handleAfterLock={() => console.log('Unlocked')}
                handleFailedAttempt={() => console.log('failed attempt')}
                renderMainIcon={() => (
                    <LogoIcon name="bowl" size={70} color="white" />
                )}
                renderBackIcon={() => (
                    <Feather name="delete" size={30} color="white" />
                )}
                renderAfterUnlock={() => (
                    <FadeIn duration={1000}>
                        <Body>
                            <LogoIcon name="bowl" size={70} color="teal" />
                            <Text
                                style={{
                                    flex: 1,
                                    alignSelf: 'center',
                                    fontSize: 40,
                                }}
                            >
                                Secrect area!!
                            </Text>
                        </Body>
                    </FadeIn>
                )}
            />
        )
    }
}
