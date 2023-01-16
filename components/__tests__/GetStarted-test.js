import * as React from 'react';
import renderer from 'react-test-renderer';
import GetStarted from '../../screens/Landing/GetStarted';

const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn()
  },
  route: {
    params: null
  },
  ...props
});

describe('Testing GetStarted Screen', () => {
  let props;

  beforeEach(() => {
    props = createTestProps({});
  });

  it('renders correctly', () => {
    // grab a snapshot of the view hierarchy rendered by React Native component without using a browser
    const testRenderer = renderer.create(<GetStarted navigation={props.navigation} route={props.route} />);
    // traverse the output to find specific nodes and make assertions about them
    const hierarchy = testRenderer.toJSON();
    const testInstance = testRenderer.root;

    expect(hierarchy).toMatchSnapshot();
  })
});

