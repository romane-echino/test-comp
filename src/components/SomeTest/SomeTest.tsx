import React from 'react';
import './SomeTest.scss';

interface ISomeTestProps {
}

interface ISomeTestState {
}

export class SomeTest extends React.Component<ISomeTestProps, ISomeTestState> {

	constructor(props: ISomeTestProps) {
		super(props);

		this.state = {
		}
	}

	render() {
		return (
			<div className="some-test">
				<div className="some-test-image">

				</div>
				<div className="some-test-text">
					<div className="some-test-text-title">Title!!!</div>
					<div className="some-test-text-description">Description</div>
				</div>
			</div>
		)
	}

}