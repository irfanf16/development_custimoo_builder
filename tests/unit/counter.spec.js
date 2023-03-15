import {mount} from "@vue/test-utils"
import counter from "../unit/counter.vue"

test('increments counter value on click', async () => {
  const wrapper = mount(counter)
  const button = wrapper.find('button')
  const text = wrapper.find('p')

  expect(text.text()).toContain('Total clicks: 0')

  await button.trigger('click')

  expect(text.text()).toContain('Total clicks: 1')
})
