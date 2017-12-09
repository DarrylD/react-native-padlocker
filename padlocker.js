//@flow

import React from 'react'
import { Text, View, Animated, TouchableOpacity, Vibration } from 'react-native'

import styled from 'styled-components/native'
import { chunk, shuffle } from 'lodash'

const DURATION = 10000
const VIBRATE_NOPE_PATTERN = [200, 400]

const Body = styled.View`
    height: 100%;
    padding: 20px 10px 0px 10px;
    background: #21ce99;
    flex-direction: column;
    justify-content: space-between;
`

const MaskedInput = styled.View`
    /* border: 1px solid white; */
    width: 100px;
    flex-direction: row;
    align-self: center;
    justify-content: space-between;
    flex: 1;
`

const Circle = styled.View`
    padding: 1px;
    height: 12px;
    max-width: 12px;
    border: 2px solid white;
    border-radius: 50;
    flex: 1;
    background-color: ${p => (p.active ? 'white' : 'transparent')};
`

const PadLock = styled.View`
    /* border: 1px solid white; */
    width: 70%;
    align-self: center;
    flex: 4;
`

const PadRow = styled.View`
    /* border: 1px solid green; */
    flex-direction: ${p => (p.vertical ? 'column' : 'row')};
    justify-content: space-between;
    /* margin-bottom: 20px; */

    align-items: ${p => (p.vertical ? 'flex-end' : 'flex-start')};
`

const PadButtonWrapper = styled.View`
    /* border: 1px solid white; */
    border-radius: 3px;
    width: 80px;
    /* height: 80px; */
    height: ${p => (p.vertical ? '50px' : '80px')};
    justify-content: center;
`

const PadText = styled.Text`
    font-size: 30px;
    align-self: center;
    color: white;
    /* font-family: tahoma, verdana, arial, sans-serif; */
    /* font-family: robotoMed; */
`

const PadButton = props => (
    <PadButtonWrapper {...props}>
        <PadText {...props} />
    </PadButtonWrapper>
)

const StatusArea = styled.View`
    /* border: 1px solid white; */
    height: 50px;
    align-items: center;
    justify-content: center;
`

const StatusAreaText = styled(PadText)``

export const LeftSide = styled.View`
    /* border: 1px solid white; */

    flex: 8;
    flex-direction: column;
    height: 40%;
    align-self: center;
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

type PadLockerState = {
    selected?: string,
    status?: string,
    unlocked: boolean,
    shuffled: Array<any>,
}

type PadLockerProps = {
    correctPin: number,
    verticalPin?: boolean,
    failedText?: string,
    backgroundColor?: string,
    handleAfterLock?: () => void,
    handleFailedAttempt?: () => void,
    renderAfterUnlock?: any,
    renderMainIcon?: () => any,
    renderBackIcon?: () => any,
}

export default class PadLocker extends React.Component<
    PadLockerProps,
    PadLockerState
> {
    state = {
        unlocked: false,
        selected: '',
        status: '',
        shuffled: [],
    }

    componentWillReceiveProps(nextProps: Object) {
        if (!this.state.selected && nextProps.verticalPin) {
            this.setShuffleSet()
        }
    }

    setShuffleSet() {
        let shuffled = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0])
        shuffled.push('back')

        this.setState({
            shuffled,
        })
    }

    handlePress(name: string) {
        const { selected } = this.state

        //handled case for back button
        if (selected && selected.length && name === 'back') {
            this.setState({
                selected: selected.substr(0, selected.length - 1),
            })

            return
        }

        if (selected && selected.length === 4) return

        this.setState(
            {
                selected: selected + name,
            },
            () => this.handleCheck()
        )
    }

    handleCheck() {
        const { selected } = this.state

        const {
            correctPin,
            handleAfterLock,
            handleFailedAttempt,
            failedText,
        } = this.props

        //if we are under 4, no need to proceed
        if (selected && selected.length !== 4) return

        console.log(`Handle check for ${selected}`)

        //if we are wrong, lets clear it
        if (selected !== this.props.correctPin.toString()) {
            this.setState({
                selected: '',
                status: failedText || 'Wrong',
            })

            Vibration.vibrate(VIBRATE_NOPE_PATTERN)

            handleFailedAttempt && handleFailedAttempt()
        } else {
            this.setState({
                unlocked: true,
            })

            handleAfterLock && handleAfterLock()
        }
    }

    renderPadLock() {
        const { renderBackIcon, verticalPin } = this.props
        const BACKNAME = 'back'

        const backIcon = renderBackIcon ? renderBackIcon() : '<'

        let buttonList = verticalPin
            ? this.state.shuffled
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, BACKNAME]

        return (
            <PadLock>
                {chunk(buttonList, 3).map((row, rowIndex) => (
                    <PadRow key={rowIndex} vertical={verticalPin}>
                        {row.map(buttonName => (
                            <TouchableOpacity
                                key={buttonName}
                                // activeOpacity={2}
                                onPress={() => this.handlePress(buttonName)}
                            >
                                <View>
                                    <PadButton vertical={verticalPin}>
                                        {buttonName === BACKNAME
                                            ? backIcon
                                            : buttonName}
                                    </PadButton>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </PadRow>
                ))}
            </PadLock>
        )
    }

    handleReset() {
        this.setState({
            unlocked: false,
            selected: '',
        })
    }

    render() {
        let { selected, unlocked, status } = this.state

        const {
            renderAfterUnlock,
            renderMainIcon,
            backgroundColor,
            verticalPin,
        } = this.props

        const isUnlocked = unlocked && selected && selected.length === 4

        //if we want to render something after unlock we have a render prop
        if (unlocked && renderAfterUnlock)
            return renderAfterUnlock(this.handleReset.bind(this))

        const styles = {}

        if (backgroundColor) styles.backgroundColor = backgroundColor

        const statusArea = (
            <StatusArea>
                {isUnlocked && <StatusAreaText>Unlocked!</StatusAreaText>}
            </StatusArea>
        )

        const masked = (
            <MaskedInput>
                {[1, 2, 3, 4].map(mask => (
                    <Circle
                        key={mask}
                        active={selected && selected.length >= mask}
                    />
                ))}
            </MaskedInput>
        )

        if (verticalPin) {
            return (
                <FadeIn duration={1000}>
                    <Body style={{ ...styles, flexDirection: 'row' }}>
                        <LeftSide>
                            {renderMainIcon && renderMainIcon()}
                            {masked}
                            {statusArea}
                        </LeftSide>

                        {this.renderPadLock()}
                    </Body>
                </FadeIn>
            )
        }

        return (
            <FadeIn duration={1000}>
                <Body style={styles}>
                    {renderMainIcon && renderMainIcon()}

                    {masked}

                    {statusArea}

                    {this.renderPadLock()}
                </Body>
            </FadeIn>
        )
    }
}
